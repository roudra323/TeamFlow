import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { User, Workspace } from "@prisma/client";

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

// Define request body types for creating and updating workspaces
interface CreateWorkspaceBody {
    name: string;
    description?: string;
}

interface UpdateWorkspaceBody {
    name?: string;
    description?: string;
}

// Create a new workspace
export const createWorkspace = async (req: Request<{}, {}, CreateWorkspaceBody>, res: Response): Promise<void> => {
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const workspace = await prisma.workspace.create({
            data: {
                name,
                description,
                ownerId: userId,
            },
            include: {
                owner: { select: { id: true, name: true, email: true } }, // Include owner details
            },
        });
        res.status(201).json({
            message: 'Workspace successfully created',
            workspace: {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                owner: workspace.owner,
                createdAt: workspace.createdAt,
                updatedAt: workspace.updatedAt,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating workspace',
            error: (error instanceof Error ? error.message : 'An unknown error occurred')
        });
    }
};

// Get all workspaces for the logged-in user
export const getWorkspaces = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const workspaces = await prisma.workspace.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { users: { some: { id: userId } } }
                ],
            },
            include: {
                owner: { select: { id: true, name: true, email: true } }, // Include owner details
                users: { select: { id: true, name: true } } // Include users
            }
        });

        res.status(200).json({
            message: 'Workspaces retrieved successfully',
            workspaces: workspaces.map(workspace => ({
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                owner: workspace.owner,
                userCount: workspace.users.length,
                createdAt: workspace.createdAt,
                updatedAt: workspace.updatedAt,
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching workspaces',
            error: (error instanceof Error ? error.message : 'An unknown error occurred')
        });
    }
};

// Update a workspace's details
export const updateWorkspace = async (req: Request<{ id: string }, {}, UpdateWorkspaceBody>, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const workspace = await prisma.workspace.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
            },
            include: {
                owner: { select: { id: true, name: true, email: true } }, // Include owner details
                users: { select: { id: true, name: true } } // Include users
            }
        });

        res.status(200).json({
            message: 'Workspace successfully updated',
            workspace: {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                owner: workspace.owner,
                userCount: workspace.users.length,
                updatedAt: workspace.updatedAt,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating workspace',
            error: (error instanceof Error ? error.message : 'An unknown error occurred')
        });
    }
};

// Delete a workspace
export const deleteWorkspace = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const workspace = await prisma.workspace.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({
            message: 'Workspace successfully deleted',
            workspace: {
                id: workspace.id,
                name: workspace.name,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting workspace',
            error: (error instanceof Error ? error.message : 'An unknown error occurred')
        });
    }
};
