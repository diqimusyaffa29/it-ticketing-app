function getRoleFromToken(token: string): string | null {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );
        return payload.role ?? null;
    } catch {
        return null;
    }
}

export default getRoleFromToken