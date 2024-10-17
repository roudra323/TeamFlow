// backend/src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express's Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    try {
        // Verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };

        // Fetch the user from the database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to the request object
        req.user = user;

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};
