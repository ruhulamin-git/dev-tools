export interface IPLocationData {
    ip: string;
    version: string;
    city: string;
    region: string;
    region_code: string;
    country: string;
    country_code: string;
    country_code_iso3: string;
    country_capital: string;
    country_tld: string;
    continent_code: string;
    in_eu: boolean;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    country_area: number;
    country_population: number;
    asn: string;
    org: string;
    error?: boolean;
    reason?: string;
}

export interface IPLookupResult {
    success: boolean;
    data?: IPLocationData;
    error?: string;
    isPrivate?: boolean;
}

/**
 * Detects the user's public IP address automatically with fallback APIs
 */
export async function detectUserIP(): Promise<IPLookupResult> {
    const fallbackAPIs = [
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json',
        'https://httpbin.org/ip',
        'https://api.myip.com'
    ];

    try {
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
            const data: IPLocationData = await response.json();
            if (!data.error) {
                return { success: true, data };
            }
        }
    } catch (error) {
        console.warn('Primary IP detection failed, trying fallbacks:', error);
    }

    for (const apiUrl of fallbackAPIs.slice(1)) {
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                let detectedIP = '';
                
                if (data.ip) {
                    detectedIP = data.ip;
                } else if (data.origin) {
                    detectedIP = data.origin;
                } else if (typeof data === 'string') {
                    detectedIP = data.trim();
                }

                if (detectedIP) {
                    return await fetchIPLocation(detectedIP);
                }
            }
        } catch (error) {
            console.warn(`Fallback API ${apiUrl} failed:`, error);
            continue;
        }
    }

    return {
        success: false,
        error: 'Auto-detection temporarily unavailable. Please use manual lookup with your IP address.'
    };
}

/**
 * Fetches IP location data from ipapi.co for a specific IP
 */
export async function fetchIPLocation(ip: string): Promise<IPLookupResult> {
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            if (response.status === 429) {
                return {
                    success: false,
                    error: 'Rate limit exceeded. Please try again in a few minutes.'
                };
            }
            
            return {
                success: false,
                error: `API request failed with status ${response.status}`
            };
        }

        const data: IPLocationData = await response.json();

        if (data.error) {
            return {
                success: false,
                error: data.reason || 'Invalid IP address or API error'
            };
        }

        return { success: true, data };

    } catch (error) {
        console.error('IP lookup error:', error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                success: false,
                error: 'Network error. Please check your internet connection.'
            };
        }
        
        return {
            success: false,
            error: 'Failed to fetch IP location data. Please try again.'
        };
    }
}

/**
 * Formats location data for display
 */
export function formatLocationData(data: IPLocationData, isAutoDetected: boolean = false): Record<string, string> {
    const ipLabel = isAutoDetected ? `${data.ip || 'N/A'} (Auto Detected)` : data.ip || 'N/A';
    
    return {
        'IP Address': ipLabel,
        'IP Version': data.version || 'N/A',
        'Country': data.country || 'N/A',
        'Country Code': data.country_code || 'N/A',
        'Region': data.region || 'N/A',
        'City': data.city || 'N/A',
        'ISP / Organization': data.org || 'N/A',
        'ASN': data.asn || 'N/A',
        'Timezone': data.timezone || 'N/A',
        'Latitude': data.latitude ? data.latitude.toString() : 'N/A',
        'Longitude': data.longitude ? data.longitude.toString() : 'N/A',
        'Postal Code': data.postal || 'N/A',
        'Currency': data.currency ? `${data.currency} (${data.currency_name})` : 'N/A'
    };
}
