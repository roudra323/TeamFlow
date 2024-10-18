import { Router } from 'express';
import { createWorkspace, getWorkspaces, updateWorkspace, deleteWorkspace } from '../controllers/workspaceController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Create a workspace
router.post('/', authenticateToken, createWorkspace);

// Get all workspaces for the logged-in user
router.get('/', authenticateToken, getWorkspaces);

// Update workspace details
router.put('/:id', authenticateToken, updateWorkspace);

// Delete a workspace
router.delete('/:id', authenticateToken, deleteWorkspace);

export default router;