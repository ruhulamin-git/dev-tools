export function formatHash(hash: string, isUpperCase: boolean): string {
    return isUpperCase ? hash.toUpperCase() : hash.toLowerCase();
}

export function getComparisonStatus(hash: string, compareHash: string): 'match' | 'mismatch' | null {
    if (!compareHash || !hash) return null;
    return compareHash.toLowerCase().trim() === hash.toLowerCase() ? 'match' : 'mismatch';
}
