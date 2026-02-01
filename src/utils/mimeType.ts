export function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return 'application/pdf';
        case 'csv': return 'text/csv'; // OR 'text/plain' if we treat as text
        case 'json': return 'application/json';
        case 'txt': return 'text/plain';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        default: return 'text/plain';
    }
}
