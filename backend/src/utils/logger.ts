export const logger = {
    info: (message: string, meta?: any) => console.log(message, meta),
    error: (message: string, error: any) => console.error(message, error)
};