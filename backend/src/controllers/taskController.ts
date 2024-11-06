import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { uploadFileToS3, deleteFileFromS3 } from '../utils/uploadFileToS3';
import fs from 'fs';
import { SocketService } from '../services/socket.service'; // Import SocketService
import { logger } from '../utils/logger'; // Import logger
import { createResponse } from '../utils/response.helper'; // Import response helper

// Helper function to initialize SocketService
const initializeSocketService = (req: Request): SocketService => {
    const io = req.app.get('io');
    return new SocketService(io);
};

// Helper function to validate board
async function validateBoard(workspaceId: number, boardId: number) {
    return await prisma.board.findFirst({
        where: {
            id: boardId,
            workspaceId: workspaceId,
        },
    });
}

// Create a new task
export const createTask = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    try {
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json(createResponse(false, null, 'Board not found in the specified workspace'));
            return;
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                boardId: board.id,
                assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
            },
        });

        const socketService = initializeSocketService(req);
        socketService.emitToWorkspace(Number(workspaceId), 'taskCreated', task);

        logger.info('Task created successfully', task);
        res.status(201).json(createResponse(true, { message: 'Task created successfully', task }));
    } catch (error) {
        logger.error('Failed to create task', error);
        res.status(500).json(createResponse(false, null, 'Failed to create task'));
    }
};

// Get all tasks in a board within a workspace
export const getTasks = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId } = req.params;

    try {
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json(createResponse(false, null, 'Board not found in the specified workspace'));
            return;
        }

        const tasks = await prisma.task.findMany({ where: { boardId: board.id } });
        res.status(200).json(createResponse(true, { tasks }));
    } catch (error) {
        logger.error('Failed to fetch tasks', error);
        res.status(500).json(createResponse(false, null, 'Failed to fetch tasks'));
    }
};

// Get a specific task by ID
export const getTask = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId, taskId } = req.params;

    try {
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json(createResponse(false, null, 'Board not found in the specified workspace'));
            return;
        }

        const task = await prisma.task.findUnique({ where: { id: parseInt(taskId) } });
        if (!task) {
            res.status(404).json(createResponse(false, null, 'Task not found'));
            return;
        }

        res.status(200).json(createResponse(true, { task }));
    } catch (error) {
        logger.error('Failed to fetch task', error);
        res.status(500).json(createResponse(false, null, 'Failed to fetch task'));
    }
};

// Update a task's details
export const updateTask = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId, taskId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    try {
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json(createResponse(false, null, 'Board not found in the specified workspace'));
            return;
        }

        const task = await prisma.task.update({
            where: { id: parseInt(taskId) },
            data: {
                title,
                description,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
            },
        });

        const socketService = initializeSocketService(req);
        socketService.emitToWorkspace(Number(workspaceId), 'taskUpdated', task);

        logger.info('Task updated successfully', task);
        res.status(200).json(createResponse(true, { message: 'Task updated successfully', task }));
    } catch (error) {
        logger.error('Failed to update task', error);
        res.status(500).json(createResponse(false, null, 'Failed to update task'));
    }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId, taskId } = req.params;

    try {
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json(createResponse(false, null, 'Board not found in the specified workspace'));
            return;
        }

        await prisma.task.delete({ where: { id: parseInt(taskId) } });
        res.status(200).json(createResponse(true, { message: 'Task deleted successfully' }));
    } catch (error) {
        logger.error('Failed to delete task', error);
        res.status(500).json(createResponse(false, null, 'Failed to delete task'));
    }
};

// Add a comment to a task
export const addComment = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, taskId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        res.status(400).json(createResponse(false, null, 'User ID is required to add a comment'));
        return;
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                taskId: parseInt(taskId),
                authorId: userId,
            },
        });

        const socketService = initializeSocketService(req);
        socketService.emitToWorkspace(Number(workspaceId), 'commentAdded', comment);

        logger.info('Comment added successfully', comment);
        res.status(201).json(createResponse(true, { message: 'Comment added successfully', comment }));
    } catch (error) {
        logger.error('Failed to add comment', error);
        res.status(500).json(createResponse(false, null, 'Failed to add comment'));
    }
};

// Get all comments for a task
export const getComments = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { taskId: parseInt(taskId) },
            include: { author: true },
        });
        res.status(200).json(createResponse(true, { comments }));
    } catch (error) {
        logger.error('Failed to fetch comments', error);
        res.status(500).json(createResponse(false, null, 'Failed to fetch comments'));
    }
};

// Delete a comment from a task
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json(createResponse(false, null, 'User not authenticated'));
        return;
    }

    try {
        const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!comment) {
            res.status(404).json(createResponse(false, null, 'Comment not found'));
            return;
        }

        if (comment.authorId !== userId) {
            res.status(403).json(createResponse(false, null, 'User not authorized to delete this comment'));
            return;
        }

        await prisma.comment.delete({ where: { id: parseInt(commentId) } });
        res.status(200).json(createResponse(true, { message: 'Comment deleted successfully' }));
    } catch (error) {
        logger.error('Failed to delete comment', error);
        res.status(500).json(createResponse(false, null, 'Failed to delete comment'));
    }
};


export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const file = req.file; // File handled by Multer
    const userId = req.user?.id;

    if (!file) {
        res.status(400).json(createResponse(false, null, 'No file uploaded'));
        return;
    }

    if (!userId) {
        res.status(401).json(createResponse(false, null, 'User not authenticated'));
        return;
    }

    try {
        // Upload file to S3
        const fileUrl = await uploadFileToS3(file.path, file.originalname);

        // Save the file URL and other details in the database
        const attachment = await prisma.attachment.create({
            data: {
                url: fileUrl,
                filename: file.originalname,
                taskId: parseInt(taskId),
                uploadedById: userId!, // Assuming userId is not undefined
            },
        });


        // Log before deleting the local file
        console.log(`Attempting to delete local file: ${file.path}`);

        // Delete the local file after uploading to S3
        fs.unlinkSync(file.path);

        res.status(201).json(createResponse(true, { message: 'File uploaded successfully', fileUrl }));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(false, null, 'Failed to upload file'));
    }
};

// Get all attachments for a task
export const getAttachments = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;

    try {
        // Fetch all attachments related to the specified task
        const attachments = await prisma.attachment.findMany({
            where: { taskId: parseInt(taskId) },
        });

        res.status(200).json(createResponse(true, { attachments }));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(false, null, 'Failed to fetch attachments'));
    }
}

// Delete an attachments for a task
export const deleteAttachment = async (req: Request, res: Response): Promise<void> => {
    const { attachmentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json(createResponse(false, null, 'User not authenticated'));
        return;
    }

    try {
        // Fetch the attachment details from the database
        const attachment = await prisma.attachment.findUnique({
            where: { id: parseInt(attachmentId) },
        });

        if (!attachment) {
            res.status(404).json(createResponse(false, null, 'Attachment not found'));
            return;
        }

        // Delete the file from S3
        await deleteFileFromS3(attachment.filename);

        // Delete the attachment record from the database
        await prisma.attachment.delete({
            where: { id: parseInt(attachmentId) },
        });

        res.status(200).json(createResponse(true, { message: 'Attachment deleted successfully' }));
    } catch (error) {
        console.error(error);
        res.status(500).json(createResponse(false, null, 'Failed to delete attachment'));
    }
};