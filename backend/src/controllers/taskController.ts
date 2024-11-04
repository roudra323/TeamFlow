import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { uploadFileToS3 } from '../utils/uploadFileToS3';
import fs from 'fs';
import path from 'path';

// Helper function to check if a board belongs to a workspace
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
        // Validate that the board exists within the specified workspace
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json({ error: 'Board not found in the specified workspace' });
            return;
        }

        // Create the task
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

        res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// Get all tasks in a board within a workspace
export const getTasks = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId } = req.params;

    try {
        // Validate that the board exists within the specified workspace
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json({ error: 'Board not found in the specified workspace' });
            return;
        }

        const tasks = await prisma.task.findMany({
            where: { boardId: board.id },
        });

        res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// Get a specific task by ID
export const getTask = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId, taskId } = req.params;

    try {
        // Validate that the board exists within the specified workspace
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json({ error: 'Board not found in the specified workspace' });
            return;
        }

        const task = await prisma.task.findUnique({
            where: { id: parseInt(taskId) },
        });

        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        res.status(200).json({ task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
};

// Update a task's details
export const updateTask = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId, taskId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    try {
        // Validate that the board exists within the specified workspace
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json({ error: 'Board not found in the specified workspace' });
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

        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId, taskId } = req.params;

    try {
        // Validate that the board exists within the specified workspace
        const board = await validateBoard(Number(workspaceId), Number(boardId));
        if (!board) {
            res.status(404).json({ error: 'Board not found in the specified workspace' });
            return;
        }

        await prisma.task.delete({
            where: { id: parseInt(taskId) },
        });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

// Add a comment to a task
export const addComment = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id; // Assuming `req.user` has the authenticated user's ID

    // Check if userId is undefined
    if (!userId) {
        res.status(400).json({ error: 'User ID is required to add a comment' });
        return;
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                taskId: parseInt(taskId),
                authorId: userId, // userId is now guaranteed to be a number
            },
        });
        res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

// Get all comments for a task
export const getComments = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { taskId: parseInt(taskId) },
            include: { author: true }, // Include author details
        });
        res.status(200).json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const file = req.file; // File handled by Multer

    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    try {
        // Upload file to S3
        const fileUrl = await uploadFileToS3(file.path, file.originalname);

        // You can save the file URL in your database if needed

        // Delete the local file after uploading to S3
        fs.unlinkSync(file.path);

        res.status(201).json({ message: 'File uploaded successfully', fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload file' });
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

        res.status(200).json({ attachments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch attachments' });
    }
}