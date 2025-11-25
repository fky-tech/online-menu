import { createScanToken } from '../Services/tokenService.js';

/**
 * Handles QR code scan - generates token and sets cookie
 */
export async function scanQR(req, res) {
    try {
        const subdomain = req.subdomain; // From middleware
        console.log('Scan request, subdomain:', subdomain);

        if (!subdomain) {
            console.log('No subdomain resolved');
            return res.status(400).json({ success: false, message: 'Invalid subdomain' });
        }

        // Create scan token
        const { token } = await createScanToken(subdomain);
        console.log('Created token for subdomain:', subdomain);

        const isProduction = process.env.NODE_ENV === 'production';
        const useCookies = process.env.USE_SCAN_COOKIES === 'true'; // Only use cookies if explicitly enabled

        if (useCookies) {
            // Set HTTP-only cookie (only in production for security)
            const cookieOptions = {
                httpOnly: isProduction ? true : false,
                secure: isProduction ? true : false,
                sameSite: isProduction ? 'lax' : 'lax', // Use 'lax' for both - allows cross-subdomain
                domain: isProduction ? '.bemicreatives.com' : undefined,
                maxAge: 10 * 60 * 1000
            };
            res.cookie('scan_token', token, cookieOptions);
        }

        // Return success with token (frontend can store it)
        res.status(200).json({
            success: true,
            message: 'QR scan successful',
            token: useCookies ? undefined : token, // Only return token if not using cookies
            redirect: '/menu' // Or whatever the menu path is
        });

    } catch (error) {
        console.error('Scan QR error:', error);
        res.status(500).json({ success: false, message: 'Failed to process QR scan' });
    }
}