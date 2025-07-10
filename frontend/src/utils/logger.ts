const API_URL = 'http://127.0.0.1:8000/api/log-error';

type LogLevel = 'info' | 'warn' | 'error';

export const logError = async (
    message: string, 
    error?: any, 
    level: LogLevel = 'error'
) => {
    try {
        const errorString = error instanceof Error ? error.toString() : (typeof error === 'object' ? JSON.stringify(error) : String(error));

        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level,
                message,
                error: errorString,
            }),
        });
    } catch (e) {
        console.error('Failed to log error to backend:', e);
    }
};
