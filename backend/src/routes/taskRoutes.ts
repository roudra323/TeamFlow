import express from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, addComment, getComments, uploadAttachment, getAttachments } from '../controllers/taskController';
import { authenticateToken } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware'; // Import your Multer configuration

const router = express.Router();

// Create a task within a specific board in a workspace
router.post('/:workspaceId/:boardId', authenticateToken, createTask);

// Get all tasks in a specific board within a workspace
router.get('/:workspaceId/:boardId', authenticateToken, getTasks);

// Get a specific task by ID within a specific board in a workspace
router.get('/:workspaceId/:boardId/:taskId', authenticateToken, getTask);

// Update a specific task by ID
router.patch('/:workspaceId/:boardId/:taskId', authenticateToken, updateTask);

// Delete a specific task by ID
router.delete('/:workspaceId/:boardId/:taskId', authenticateToken, deleteTask);

// Add comment to a task
router.post('/:workspaceId/:boardId/:taskId/comments', authenticateToken, addComment);

// Get comments for a task
router.get('/:workspaceId/:boardId/:taskId/comments', authenticateToken, getComments);

// Get attachments for a task
router.get('/:workspaceId/:boardId/:taskId/attachments', authenticateToken, getAttachments);

// Upload an attachment to a task
router.post(
    '/:workspaceId/:boardId/:taskId/attachments',
    authenticateToken,
    upload.single('file'),
    uploadAttachment
);

export default router;