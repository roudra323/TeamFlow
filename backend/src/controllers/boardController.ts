// backend/src/controllers/boardController.ts

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Helper function to send a response only if one hasn't been sent yet
const safeResponse = (res: Response, statusCode: number, body: any) => {
    if (!res.headersSent) {
        res.status(statusCode).json(body);
    }
};

// Create a new board within a workspace
export const createBoard = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const { name } = req.body;

    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: Number(workspaceId) },
        });

        if (!workspace) {
            safeResponse(res, 404, { error: 'Workspace not found' });
            return;
        }

        const board = await prisma.board.create({
            data: {
                name,
                workspace: { connect: { id: Number(workspaceId) } },
            },
        });

        safeResponse(res, 201, { board });
    } catch (error) {
        console.error(error);
        safeResponse(res, 500, { error: 'Failed to create board' });
    }
};

// Get all boards for a specific workspace
export const getBoards = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;

    try {
        const boards = await prisma.board.findMany({
            where: { workspaceId: Number(workspaceId) },
        });

        safeResponse(res, 200, { boards });
    } catch (error) {
        console.error(error);
        safeResponse(res, 500, { error: 'Failed to fetch boards' });
    }
};

// Find a specific board information
export const getBoard = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId } = req.params;

    try {
        const board = await prisma.board.findFirst({
            where: {
                id: Number(boardId),
                workspaceId: Number(workspaceId),
            },
        });

        if (!board) {
            safeResponse(res, 404, { error: 'Board not found' });
            return;
        }

        safeResponse(res, 200, { board });
    } catch (error) {
        console.error(error);
        safeResponse(res, 500, { error: 'Failed to fetch board' });
    }
};

// Update a board's name
export const updateBoard = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId } = req.params;
    const { name } = req.body;

    try {
        const board = await prisma.board.findFirst({
            where: {
                id: Number(boardId),
                workspaceId: Number(workspaceId),
            },
        });

        if (!board) {
            safeResponse(res, 404, { error: 'Board not found in the specified workspace' });
            return;
        }

        const updatedBoard = await prisma.board.update({
            where: {
                id: Number(boardId),
            },
            data: { name },
        });

        safeResponse(res, 200, { message: 'Board updated successfully', board: updatedBoard });
    } catch (error) {
        console.error(error);
        safeResponse(res, 500, { error: 'Failed to update board' });
    }
};

// Delete a board
export const deleteBoard = async (req: Request, res: Response): Promise<void> => {
    const { workspaceId, boardId } = req.params;

    try {
        const board = await prisma.board.findFirst({
            where: {
                id: Number(boardId),
                workspaceId: Number(workspaceId),
            },
        });

        if (!board) {
            safeResponse(res, 404, { error: 'Board not found in the specified workspace' });
            return;
        }

        await prisma.board.delete({
            where: {
                id: Number(boardId),
            },
        });

        safeResponse(res, 200, { message: 'Board deleted successfully' });
    } catch (error) {
        console.error(error);
        safeResponse(res, 500, { error: 'Failed to delete board' });
    }
};