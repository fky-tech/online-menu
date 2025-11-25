import { validateAndConsumeScanToken } from '../Services/tokenService.js';
import { supabaseAdmin } from '../Config/supabase.js';

/**
 * Handles posting a comment after validating scan token
 */
export async function postComment(req, res) {
    try {
        const { comment_text, menu_item_name, scan_token } = req.body;
        const subdomain = req.subdomain;

        const isProduction = process.env.NODE_ENV === 'production';
        const useCookies = process.env.USE_SCAN_COOKIES === 'true';

        let token;
        if (useCookies) {
            token = req.cookies.scan_token;
        } else {
            token = scan_token || req.headers['x-scan-token'];
        }

        // Validate required fields
        if (!comment_text || !comment_text.trim()) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'No scan token found. Please scan QR code first.' });
        }

        if (!subdomain) {
            return res.status(400).json({ success: false, message: 'Invalid subdomain' });
        }

        // Validate and consume scan token
        const isValid = await validateAndConsumeScanToken(token, subdomain);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid or expired scan token. Please scan QR code again.' });
        }

        // Get restaurant ID from subdomain
        const restaurantId = req.restaurantId;

        // No validation needed for menu_item_name - just log it
        console.log('Menu item name:', menu_item_name);

        // Insert comment
        const commentData = {
            restaurant_id: restaurantId,
            comment_text: comment_text.trim(),
            menu_item_name: menu_item_name || null
        };

        const { data, error } = await supabaseAdmin
            .from('comments')
            .insert(commentData)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to save comment: ${error.message}`);
        }

        res.status(201).json({
            success: true,
            message: 'Comment posted successfully',
            data: {
                id: data.id,
                created_at: data.created_at
            }
        });

    } catch (error) {
        console.error('Post comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to post comment' });
    }
}

/**
 * Gets comments for a restaurant (public view)
 */
export async function getComments(req, res) {
    try {
        const restaurantId = req.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('comments')
            .select(`
                id,
                comment_text,
                menu_item_name,
                created_at
            `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch comments: ${error.message}`);
        }

        res.status(200).json({
            success: true,
            data: data || []
        });

    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
}