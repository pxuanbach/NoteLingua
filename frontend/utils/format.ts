
// format date as YYYY-MM-DD
export function formatDate(dateText?: string): string {
    if (!dateText) return '';

    const date = new Date(dateText);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// format datetime as YYYY-MM-DD HH:MM
export function formatDateTime(dateText?: string): string {
    if (!dateText) return '';

    const date = new Date(dateText);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
