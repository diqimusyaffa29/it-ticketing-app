const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${baseURL.replace(/\/$/, '')}${path}`;
};

export { getImageUrl }