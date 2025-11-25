import { supabaseAdmin, uploadFile, getPublicUrl, deleteFile } from '../supabase.js';

// Get payment info for restaurant
export const getPaymentModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw error;
  }
};

// Get single payment method by ID
export const getPaymentByIdModel = async (restaurantId, id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting payment by ID:', error);
    throw error;
  }
};

// Create or update payment method (upsert)
export const upsertPaymentModel = async (restaurantId, paymentData, logoFile = null) => {
  try {
    let logoUrl = paymentData.logo_url;

    // Handle logo upload if file is provided
    if (logoFile) {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${logoFile.originalname}`;
      const filePath = `payment-logos/${fileName}`;
      
      await uploadFile('payment-logos', filePath, logoFile.buffer, {
        contentType: logoFile.mimetype,
        upsert: false
      });
      
      logoUrl = getPublicUrl('payment-logos', filePath);
    }

    const { data, error } = await supabaseAdmin
      .from('payment')
      .insert({
        restaurant_id: restaurantId,
        payment_method: paymentData.payment_method,
        account_details: paymentData.account_details,
        logo_url: logoUrl,
        is_active: paymentData.is_active !== undefined ? paymentData.is_active : true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting payment:', error);
    throw error;
  }
};

// Update payment method
export const updatePaymentModel = async (restaurantId, id, updates, logoFile = null) => {
  try {
    let logoUrl = updates.logo_url;

    // Handle logo upload if file is provided
    if (logoFile) {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${logoFile.originalname}`;
      const filePath = `payment-logos/${fileName}`;
      
      await uploadFile('payment-logos', filePath, logoFile.buffer, {
        contentType: logoFile.mimetype,
        upsert: false
      });
      
      logoUrl = getPublicUrl('payment-logos', filePath);
      updates.logo_url = logoUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('payment')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Delete payment method
export const deletePaymentModel = async (restaurantId, id) => {
  try {
    // Get payment info to delete logo file if exists
    const payment = await getPaymentByIdModel(restaurantId, id);
    
    if (payment && payment.logo_url && payment.logo_url.includes('payment-logos/')) {
      try {
        const urlParts = payment.logo_url.split('payment-logos/');
        if (urlParts.length > 1) {
          const filePath = `payment-logos/${urlParts[1]}`;
          await deleteFile('payment-logos', filePath);
        }
      } catch (fileError) {
        console.warn('Could not delete payment logo file:', fileError);
      }
    }

    const { error } = await supabaseAdmin
      .from('payment')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// List all payment methods (super admin)
export const listAllPaymentModel = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment')
      .select(`
        *,
        restaurants(name, slug)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing all payments:', error);
    throw error;
  }
};

// Get active payment methods for restaurant
export const getActivePaymentMethodsModel = async (restaurantId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting active payment methods:', error);
    throw error;
  }
};

// Toggle payment method active status
export const togglePaymentStatusModel = async (restaurantId, id) => {
  try {
    const payment = await getPaymentByIdModel(restaurantId, id);
    
    if (!payment) {
      throw new Error('Payment method not found');
    }

    const { data, error } = await supabaseAdmin
      .from('payment')
      .update({ is_active: !payment.is_active })
      .eq('restaurant_id', restaurantId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling payment status:', error);
    throw error;
  }
};

// Get payment statistics (super admin)
export const getPaymentStatsModel = async () => {
  try {
    const { data: totalPayments, error: totalError } = await supabaseAdmin
      .from('payment')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const { data: activePayments, error: activeError } = await supabaseAdmin
      .from('payment')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    const { data: withLogos, error: logoError } = await supabaseAdmin
      .from('payment')
      .select('*', { count: 'exact', head: true })
      .not('logo_url', 'is', null);

    if (logoError) throw logoError;

    return {
      total: totalPayments || 0,
      active: activePayments || 0,
      with_logos: withLogos || 0
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    throw error;
  }
};

// Search payment methods
export const searchPaymentMethodsModel = async (restaurantId, searchTerm) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .or(`payment_method.ilike.%${searchTerm}%,account_details.ilike.%${searchTerm}%`)
      .order('payment_method');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching payment methods:', error);
    throw error;
  }
};

// Validate payment data
export const validatePaymentDataModel = (paymentData) => {
  const errors = [];

  if (!paymentData.payment_method || paymentData.payment_method.trim() === '') {
    errors.push('Payment method is required');
  }

  if (!paymentData.account_details || paymentData.account_details.trim() === '') {
    errors.push('Account details are required');
  }

  if (paymentData.payment_method && paymentData.payment_method.length > 100) {
    errors.push('Payment method must be less than 100 characters');
  }

  if (paymentData.account_details && paymentData.account_details.length > 500) {
    errors.push('Account details must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get payment methods count for restaurant
export const getPaymentMethodsCountModel = async (restaurantId) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('payment')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting payment methods count:', error);
    throw error;
  }
};

