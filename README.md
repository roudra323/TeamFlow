
# TeamFlow - Collaborative Task Management System (Backend)

## Overview
TeamFlow is a collaborative task management tool designed to enhance team productivity and streamline project management. It provides features like creating workspaces, managing tasks, real-time collaboration, role-based access control, notifications, and file attachments, making it suitable for small teams and large enterprises alike.

## Features Implemented

### 1. User Authentication & Authorization
- **Registration & Login**: Secure user registration and login functionality using JWT-based authentication.
- **Password Hashing**: Passwords are securely hashed using `bcrypt` for enhanced security.
- **Role-Based Access Control (RBAC)**: Users are assigned roles such as Admin, Member, or Viewer, with different levels of permissions within a workspace.
- **Middleware**: Custom authentication middleware to ensure secure access to protected routes.

### 2. Workspaces and Boards
- **Workspaces**: Users can create and manage multiple workspaces for different projects.
- **Boards**: Workspaces contain boards that are used for task organization (e.g., Kanban-style).
- **CRUD Operations**: Full support for creating, reading, updating, and deleting workspaces and boards.
- **Routing**: Modular route definitions for managing workspaces and boards (`workspaceRoutes.ts`, `boardRoutes.ts`).

### 3. Task Management
- **Task Creation and Assignment**: Users can create tasks within a workspace and assign them to team members.
- **Task Details**: Each task can include details such as title, description, due date, priority, and labels.
- **Comments and Attachments**: Users can comment on tasks and upload attachments.
- **Real-Time Updates**: Tasks and comments are updated in real-time using Socket.IO.
- **Routes and Controllers**: Comprehensive routing for task operations (`taskRoutes.ts`, `taskController.ts`).

### 4. Real-Time Collaboration
- **WebSockets**: Integrated Socket.IO for real-time updates, ensuring changes are visible instantly to all users in a workspace.
- **Presence Indicators**: Users can see who is online and active within a workspace.

### 5. File Handling and Storage
- **File Uploads**: Implemented with `Multer` for handling file uploads.
- **Cloud Storage**: Uploaded files are stored securely in AWS S3 with dedicated functions for file upload and deletion (`uploadFileToS3.ts`).
- **Attachment Management**: Users can upload, view, and delete attachments linked to tasks.

### 6. Database Integration
- **Prisma ORM**: Used for database operations with a focus on efficient data retrieval and relationship management.
- **PostgreSQL**: The project uses PostgreSQL as the primary relational database for structured data storage.

### 7. Logging and Error Handling
- **Custom Logger**: Basic logger implemented for tracking errors and important actions (`logger.ts`).
- **Error Handling**: Comprehensive error handling within controllers to provide informative responses to the client.

### 8. Helper Utilities
- **Response Helper**: Standardized response structure for API responses (`response.helper.ts`).
- **Password Utilities**: Utility functions for hashing and comparing passwords (`hash.ts`).

### 9. Server and Middleware
- **Express.js**: Core server framework (`server.ts`, `app.ts`).
- **Environment Variables**: Configured using `dotenv` for managing sensitive data and environment-specific settings.

## Folder Structure
```
.
├── controllers
│   ├── userController.ts
│   ├── workspaceController.ts
│   ├── boardController.ts
│   ├── taskController.ts
│   └── ...
├── middlewares
│   ├── authMiddleware.ts
│   ├── uploadMiddleware.ts
│   └── ...
├── routes
│   ├── authRoutes.ts
│   ├── workspaceRoutes.ts
│   ├── boardRoutes.ts
│   ├── taskRoutes.ts
│   └── ...
├── utils
│   ├── response.helper.ts
│   ├── hash.ts
│   ├── uploadFileToS3.ts
│   └── logger.ts
├── prisma.ts
├── server.ts
├── app.ts
└── README.md
```

## Technologies Used
- **Programming Language**: TypeScript
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **File Storage**: AWS S3
- **Real-Time Communication**: Socket.IO
- **Authentication**: JWT, `bcrypt` for password hashing
- **Middleware**: `Multer` for file uploads, custom authentication middleware
- **Environment Management**: `dotenv`

## Next Steps
- **Implement Redis**: For caching frequently accessed data and optimizing API response times.
- **Add Advanced Logging**: Integrate with `Winston` or `Pino` for structured logging.
- **Implement Search Functionality**: Use Elasticsearch for full-text search capabilities.
- **Enhance Security**: Integrate `Helmet.js` for HTTP headers security and `csurf` for CSRF protection.
- **Monitoring and Alerts**: Integrate `Prometheus` and `Grafana` for in-depth monitoring.
- **Job Scheduling**: Add `Bull` or `BullMQ` for background jobs and task scheduling.

## Getting Started
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/team-work-hub.git
   cd team-work-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file and set the following:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=your_database_url
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BUCKET=your_bucket_name
   ```

4. **Run the server**:
   ```bash
   npm run dev
   ```

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

Feel free to modify this `README.md` to include any specific instructions, custom branding, or links relevant to your project.
