// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import other routes once created
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import boardRoutes from './routes/boardRoutes';
// import taskRoutes from './routes/taskRoutes';
// import commentRoutes from './routes/commentRoutes';
// import attachmentRoutes from './routes/attachmentRoutes';
import { authenticateToken } from './middlewares/authMiddleware'; // Middleware for authentication


dotenv.config(); // Load environment variables

const app = express(); // Create Express app

// Middleware
app.use(cors());
app.use(express.json());


// Register your routes here
app.use('/api/auth', authRoutes); // Public routes for user authentication
app.use('/api/workspaces', authenticateToken, workspaceRoutes); // Protected routes (require authentication)
app.use('/api/workspaces/boards', authenticateToken, boardRoutes);
// app.use('/api/tasks', authenticateToken, taskRoutes);
// app.use('/api/comments', authenticateToken, commentRoutes);
// app.use('/api/attachments', authenticateToken, attachmentRoutes);

app.get('/', (req, res) => {
    res.send('TeamFlow API is running');
});

export default app; // Export the Express app
