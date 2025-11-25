import crypto from 'crypto';
import { supabaseAdmin } from './supabase';

/**
 * Generates a cryptographically secure random token
 * @returns {string} Base64 encoded token
 */
export function generateSecureToken() {
    return crypto.randomBytes(32).toString('base64');
}

/**
 * Calculates token expiration time (10 minutes from now)
 * @returns {Date} Expiration date
 */
export function getTokenExpiration() {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}

/**
 * Creates a new scan token for a subdomain
 * @param {string} subdomain - The restaurant subdomain
 * @returns {Promise<{token: string, expiresAt: Date}>} Token data
 */
export async function createScanToken(subdomain) {
    const token = generateSecureToken();
    const expiresAt = getTokenExpiration();

    const { data, error } = await supabaseAdmin
        .from('scan_tokens')
        .insert({
            token,
            subdomain,
            expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create scan token: ${error.message}`);
    }

    return {
        token: data.token,
        expiresAt: new Date(data.expires_at)
    };
}

/**
 * Validates a scan token (for checking validity without marking as used)
 * @param {string} token - The token to validate
 * @param {string} subdomain - Expected subdomain
 * @returns {Promise<boolean>} True if valid
 */
export async function validateScanToken(token, subdomain) {
    console.log('Validating token:', token, 'subdomain:', subdomain);
    const { data, error } = await supabaseAdmin
        .from('scan_tokens')
        .select('*')
        .eq('token', token)
        .eq('subdomain', subdomain)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

    console.log('Validation query result:', { data, error });
    return !error && !!data;
}

/**
 * Validates and consumes a scan token (marks as used)
 * @param {string} token - The token to validate
 * @param {string} subdomain - Expected subdomain
 * @returns {Promise<boolean>} True if valid and marked as used
 */
export async function validateAndConsumeScanToken(token, subdomain) {
    const isValid = await validateScanToken(token, subdomain);
    if (!isValid) return false;

    // Mark as used
    await supabaseAdmin
        .from('scan_tokens')
        .update({ used: true })
        .eq('token', token);

    return true;
}
