// backend/src/routes/boardRoutes.ts

import express from 'express';
import { createBoard, getBoards, getBoard, updateBoard, deleteBoard } from '../controllers/boardController';
import { authenticateToken } from '../middlewares/authMiddleware';  // If using JWT authentication


const router = express.Router();

// Create a new board in a workspace
router.post('/:workspaceId', authenticateToken, createBoard);

// Get all boards for a specific workspace
router.get('/:workspaceId', authenticateToken, getBoards);

// Find a specific board
router.get('/:workspaceId/:boardId', authenticateToken, getBoard);

// Update a specific board
router.put('/:workspaceId/:boardId', authenticateToken, updateBoard);

// Delete a specific board
router.delete('/:workspaceId/:boardId', authenticateToken, deleteBoard);

export default router;
