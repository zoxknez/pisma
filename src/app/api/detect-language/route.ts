import { NextResponse } from 'next/server';

// Free IP Geolocation API
// Returns country code based on IP
export async function GET(request: Request) {
  try {
    // Get client IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Serbian and regional country codes
    const serbianCountries = ['RS', 'BA', 'ME', 'HR', 'MK', 'SI'];
    
    // Try to get geo data from free API
    try {
      // Using ip-api.com (free, no key needed, 45 req/min limit)
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const countryCode = geoData.countryCode;
        
        // If from Serbia or regional country, use Serbian
        const language = serbianCountries.includes(countryCode) ? 'sr' : 'en';
        
        return NextResponse.json({
          language,
          countryCode,
          ip: ip === 'unknown' ? null : ip.substring(0, 10) + '...'
        });
      }
    } catch (geoError) {
      console.error('Geo lookup failed:', geoError);
    }

    // Fallback: check Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const prefersSrbian = acceptLanguage.toLowerCase().includes('sr') || 
                          acceptLanguage.toLowerCase().includes('hr') ||
                          acceptLanguage.toLowerCase().includes('bs');
    
    return NextResponse.json({
      language: prefersSrbian ? 'sr' : 'en',
      countryCode: null,
      fallback: true
    });

  } catch (error) {
    console.error('Language detection error:', error);
    return NextResponse.json({ language: 'en', error: true });
  }
}
