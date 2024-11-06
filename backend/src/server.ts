// backend/src/server.ts

import http from 'http';
import { Server, Socket } from 'socket.io';
import app from './app';

// Types and Interfaces
interface OnlineUser {
    workspaceId: number;
    userId: number;
}

interface SocketError {
    message: string;
    code: string;
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
    },
});

// Maintain a list of online users
const onlineUsers = new Map<string, OnlineUser>();

// Memory cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Cleanup function for inactive sockets
function cleanupInactiveSockets() {
    for (const [socketId, user] of onlineUsers.entries()) {
        if (!io.sockets.sockets.get(socketId)) {
            onlineUsers.delete(socketId);
            console.log(`Cleaned up inactive socket: ${socketId}`);
        }
    }
}

// Start periodic cleanup
setInterval(cleanupInactiveSockets, CLEANUP_INTERVAL);

// Socket error handler
function handleSocketError(socket: Socket, error: SocketError) {
    console.error(`Socket error for ${socket.id}:`, error);
    socket.emit('error', error);
}

// Listen for client connections
io.on('connection', (socket: Socket) => {
    try {
        console.log('A user connected:', socket.id);

        socket.on('joinWorkspace', (workspaceId: number, userId: number) => {
            try {
                // Validate input
                if (typeof workspaceId !== 'number' || typeof userId !== 'number') {
                    throw { message: 'Invalid workspaceId or userId', code: 'INVALID_INPUT' };
                }

                // Join workspace room
                const workspaceRoom = `workspace_${workspaceId}`;
                socket.join(workspaceRoom);
                onlineUsers.set(socket.id, { workspaceId, userId });

                // Emit presence update
                io.to(workspaceRoom).emit('userOnline', {
                    userId,
                    timestamp: new Date().toISOString()
                });

                console.log(`Socket ${socket.id} joined workspace_${workspaceId}`);
            } catch (error) {
                handleSocketError(socket, error as SocketError);
            }
        });

        socket.on('leaveWorkspace', (workspaceId: number) => {
            try {
                // Validate input
                if (typeof workspaceId !== 'number') {
                    throw { message: 'Invalid workspaceId', code: 'INVALID_INPUT' };
                }

                const user = onlineUsers.get(socket.id);
                if (user) {
                    // Emit presence update
                    io.to(`workspace_${workspaceId}`).emit('userOffline', {
                        userId: user.userId,
                        timestamp: new Date().toISOString()
                    });
                    onlineUsers.delete(socket.id);
                }

                socket.leave(`workspace_${workspaceId}`);
                console.log(`Socket ${socket.id} left workspace_${workspaceId}`);
            } catch (error) {
                handleSocketError(socket, error as SocketError);
            }
        });

        socket.on('disconnect', () => {
            try {
                const user = onlineUsers.get(socket.id);
                if (user) {
                    io.to(`workspace_${user.workspaceId}`).emit('userOffline', {
                        userId: user.userId,
                        timestamp: new Date().toISOString()
                    });
                    onlineUsers.delete(socket.id);
                }
                console.log('User disconnected:', socket.id);
            } catch (error) {
                console.error('Error in disconnect handler:', error);
            }
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

    } catch (error) {
        console.error('Error in connection handler:', error);
    }
});

// Make Socket.IO instance available in Express routes
app.set('io', io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});