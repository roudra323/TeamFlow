// backend/src/index.ts

import http from 'http';
import { Server } from 'socket.io';
import app from './app';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
    cors: {
        origin: '*', // Replace '*' with your frontend URL in production for security
        methods: ['GET', 'POST'],
    },
});

// Listen for client connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle joining a workspace room
    socket.on('joinWorkspace', (workspaceId: number) => {
        socket.join(`workspace_${workspaceId}`);
        console.log(`Socket ${socket.id} joined workspace_${workspaceId}`);
    });

    // Handle leaving a workspace room
    socket.on('leaveWorkspace', (workspaceId: number) => {
        socket.leave(`workspace_${workspaceId}`);
        console.log(`Socket ${socket.id} left workspace_${workspaceId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make Socket.IO instance available in Express routes
app.set('io', io);

// Make Socket.IO instance available in Express routes via app.locals
app.locals.io = io;
// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
