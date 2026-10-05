/**
 * Validates if a string is a valid IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
    if (!ip) return false;
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
}

/**
 * Validates if a string is a valid IPv6 address
 */
export function isValidIPv6(ip: string): boolean {
    if (!ip) return false;
    if (ip === '::') return true;
    if (ip === '::1') return true;
    if (ip.includes(':::')) return false;
    if ((ip.match(/::/g) || []).length > 1) return false;
    
    if (ip.includes('.')) {
        const parts = ip.split('::');
        if (parts.length === 2) {
            const rightPart = parts[1];
            if (rightPart.includes('.')) {
                const ipv4Part = rightPart.split(':').pop();
                if (ipv4Part && isValidIPv4(ipv4Part)) {
                    const leftPart = parts[0];
                    if (leftPart === '' || leftPart === 'ffff' || /^[0-9a-fA-F]{1,4}$/.test(leftPart)) {
                        return true;
                    }
                }
            }
        }
    }
    
    if (ip.includes('::')) {
        const parts = ip.split('::');
        if (parts.length !== 2) return false;
        
        const leftPart = parts[0];
        const rightPart = parts[1];
        const leftGroups = leftPart ? leftPart.split(':') : [];
        const rightGroups = rightPart ? rightPart.split(':') : [];
        
        for (const group of [...leftGroups, ...rightGroups]) {
            if (group !== '' && !/^[0-9a-fA-F]{1,4}$/.test(group)) {
                return false;
            }
        }
        
        const totalExplicitGroups = leftGroups.filter(g => g !== '').length + rightGroups.filter(g => g !== '').length;
        return totalExplicitGroups < 8;
    } else {
        const groups = ip.split(':');
        if (groups.length !== 8) return false;
        
        for (const group of groups) {
            if (!/^[0-9a-fA-F]{1,4}$/.test(group)) {
                return false;
            }
        }
        
        return true;
    }
}

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 */
export function isValidIP(ip: string): boolean {
    return isValidIPv4(ip) || isValidIPv6(ip);
}

/**
 * Determines the IP version (4 or 6)
 */
export function getIPVersion(ip: string): 4 | 6 | null {
    if (isValidIPv4(ip)) return 4;
    if (isValidIPv6(ip)) return 6;
    return null;
}

/**
 * Checks if an IP address is private/local
 */
export function isPrivateIP(ip: string): boolean {
    if (!isValidIPv4(ip)) return false;
    
    const parts = ip.split('.').map(Number);
    
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    
    return false;
}

/**
 * Checks if an IP address is public
 */
export function isPublicIP(ip: string): boolean {
    return isValidIP(ip) && !isPrivateIP(ip);
}

/**
 * Gets a human-readable IP type description
 */
export function getIPTypeDescription(ip: string): string {
    if (!isValidIP(ip)) return 'Invalid IP';
    
    const version = getIPVersion(ip);
    const isPrivate = isPrivateIP(ip);
    
    if (version === 4) {
        return isPrivate ? 'Private IPv4' : 'Public IPv4';
    } else if (version === 6) {
        return 'IPv6';
    }
    
    return 'Unknown';
}
