// Format a date to a human-readable format
export function formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

// Format a time to a human-readable format
export function formatTime(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}