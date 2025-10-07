# Restaurant Admin Assignment Feature

## Overview
When a super admin creates a new restaurant, they now assign an admin email and a random password is automatically generated for that restaurant's admin.

## What Changed

### 1. Database Schema
Added new table `restaurant_admin_credentials` to store admin credentials:
- `restaurant_id` (primary key)
- `admin_email` 
- `plain_password` (stored temporarily for super admin to copy)
- `created_at`

### 2. Backend Changes

**New Model**: `backend/Models/restaurantAdminCredentialsModel.js`
- `storeAdminCredentials()` - Store admin credentials
- `getAdminCredentials()` - Get credentials for a restaurant
- `listAllAdminCredentials()` - List all credentials (super admin only)

**Updated Controller**: `backend/Controllers/restaurantsController.js`
- `createRestaurant()` now requires `admin_email` field
- Automatically generates a 16-character random password
- Creates tenant admin user with bcrypt-hashed password
- Stores plain password for super admin to copy
- Returns password in response

- `listRestaurants()` now includes admin credentials for super admin

### 3. Frontend Changes

**Add Restaurant Form** (`frontend/src/pages/AdminAddRestaurant.jsx`)
- Added "Admin Email" required field
- Shows generated password after creation with copy button
- Displays warning to save password

**View Restaurants** (`frontend/src/pages/AdminRestaurants.jsx`)
- Shows admin email for each restaurant
- "Copy Password" button for each restaurant (super admin only)
- Copies password to clipboard on click

## How to Use

### For New Installations
1. Run the updated platform schema:
   ```bash
   mysql -u root -p < backend/sql/platform_schema.sql
   ```

### For Existing Installations
1. Run the migration to add the new table:
   ```bash
   mysql -u root -p < backend/sql/migration_add_admin_credentials.sql
   ```

### Creating a Restaurant
1. Login as super admin
2. Go to "Add Restaurant"
3. Fill in:
   - Name (required)
   - Description (optional)
   - Logo URL (optional)
   - **Admin Email (required)** - This will be the restaurant admin's login email
4. Click "Create"
5. **Copy the generated password** - it's shown once on the success screen
6. You can also copy it later from "View Restaurants"

### Accessing Restaurant Admin
The restaurant admin can login at:
- `http://slug.localhost:5173/admin/restaurant/slug` (dev)
- `http://slug.yourdomain.com/admin/restaurant/slug` (production)

With credentials:
- Email: the email you provided
- Password: the generated password (copy from super admin dashboard)

## Security Notes

⚠️ **Important**: The plain passwords are stored in the database for super admin convenience. In production:
- Consider encrypting the `plain_password` column
- Or implement a "reset password" flow and delete stored passwords after first use
- Restrict database access to authorized personnel only

## Password Format
- 16 characters
- Base64-encoded random bytes
- Example: `xK9mP2vL8nQ4wR7t`

## API Changes

### POST /api/restaurants
**New required field**:
```json
{
  "name": "Restaurant Name",
  "admin_email": "admin@restaurant.com",
  "description": "Optional",
  "logo_url": "Optional"
}
```

**Response includes**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Restaurant Name",
    "slug": "restaurant-name",
    "admin_email": "admin@restaurant.com",
    "admin_password": "xK9mP2vL8nQ4wR7t"
  }
}
```

### GET /api/restaurants
**For super admin, response includes**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Restaurant Name",
      "slug": "restaurant-name",
      "admin_email": "admin@restaurant.com",
      "admin_password": "xK9mP2vL8nQ4wR7t"
    }
  ]
}
```

## Testing

1. **Create a restaurant**:
   - Login as super admin (owner@example.com / password)
   - Add restaurant with admin email
   - Verify password is shown and can be copied

2. **View restaurants**:
   - Go to "View Restaurants"
   - Verify admin email is shown
   - Click "Copy Password" and verify it copies to clipboard

3. **Login as restaurant admin**:
   - Go to the restaurant's admin URL
   - Login with the email and copied password
   - Verify access to restaurant admin dashboard

