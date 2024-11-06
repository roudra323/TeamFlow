export const createResponse = (success: boolean, data?: any, error?: string) => ({
    success,
    data,
    error
});