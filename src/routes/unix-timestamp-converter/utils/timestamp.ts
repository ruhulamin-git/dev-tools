export function getCurrentTimestamp(includeMilliseconds = false): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').replace('Z', includeMilliseconds ? '' : '.000Z').split('.')[0] + 
           (includeMilliseconds ? `.${now.getUTCMilliseconds().toString().padStart(3, '0')}Z` : 'Z');
}