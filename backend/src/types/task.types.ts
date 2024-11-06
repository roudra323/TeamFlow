export interface TaskInput {
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: Date;
    assigneeId?: number;
}


export interface CommentInput {
    content: string;
}