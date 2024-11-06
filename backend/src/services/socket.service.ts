// src/services/socket.service.ts
import { Server } from 'socket.io';

export class SocketService {
    constructor(private io: Server) {
        if (!io) {
            throw new Error('Socket.io instance is required');
        }
    }

    emitToWorkspace(workspaceId: number, event: string, data: any) {
        try {
            this.io.to(`workspace_${workspaceId}`).emit(event, data);
        } catch (error) {
            console.error(`Failed to emit ${event} to workspace ${workspaceId}:`, error);
        }
    }
}