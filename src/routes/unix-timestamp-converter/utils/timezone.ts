// /Users/macbook/Projects/devxhub/dev-tools-boilerplate/src/lib/converter/utils/timezone.ts
export const TIMEZONES = [
    { value: 'UTC', label: 'UTC', offset: 0 },
    { value: 'America/New_York', label: 'Eastern Time (ET)', offset: -5 },
    { value: 'America/Chicago', label: 'Central Time (CT)', offset: -6 },
    { value: 'America/Denver', label: 'Mountain Time (MT)', offset: -7 },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: -8 },
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
    { value: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5 },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 11 },
];

export function convertToTimezone(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).format(date);
}

export function getTimezoneOffset(timezone: string): number {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const timezoneTime = new Date(utcTime);
    return (timezoneTime.getTime() - now.getTime()) / (1000 * 60 * 60);
}

export function getCurrentTimeInTimezone(timezone: string): string {
    return convertToTimezone(new Date(), timezone);
}