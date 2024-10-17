import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Define interfaces for the request bodies
interface RegisterUserBody {
    name: string;
    email: string;
    password: string;
}

interface LoginUserBody {
    email: string;
    password: string;
}

/**
 * Register a new user.
 */
export async function registerUser(req: Request<{}, {}, RegisterUserBody>, res: Response) {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({
            status: "error",
            message: `User registration failed: An account with the email ${email} already exists.`,
            code: 400,
            error: {
                email: email,
                details: "An account with this email is already registered. Please log in or use a different email to register."
            }
        });
    }

    // Hash the password and create the user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
    });

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
        status: "success",
        message: "User registered successfully.",
        code: 201,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token: token,
            info: "You can use this token to access secure resources. It expires in 1 hour."
        }
    });
}

/**
 * Log in a user.
 */
export async function loginUser(req: Request<{}, {}, LoginUserBody>, res: Response) {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(400).json({
            status: "error",
            message: `Login failed: No account found with the email ${email}.`,
            code: 400,
            error: {
                email: email,
                details: "Please check your credentials or register if you don't have an account."
            }
        });
    }

    // Compare the password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            status: "error",
            message: `Login failed: Incorrect password for the email ${email}.`,
            code: 400,
            error: {
                email: email,
                details: "The password you entered is incorrect. Please try again or reset your password."
            }
        });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
        status: "success",
        message: "Login successful.",
        code: 200,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token: token,
            info: "You can use this token to access secure resources. It expires in 1 hour."
        }
    });
}
