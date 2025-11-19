# Route Security Implementation

This document explains the comprehensive route security system implemented in the Angular application.

## Overview

The application now has a robust security system that includes:
- **Authentication Guards** - Protect routes from unauthenticated users
- **Role-based Guards** - Control access based on user roles
- **Login Guards** - Redirect authenticated users away from login pages
- **Token Validation** - Automatic token expiration handling
- **Error Handling** - Automatic logout on authentication errors

## Guards

### 1. AuthGuard (`auth.guard.ts`)
- **Purpose**: Protects routes that require authentication
- **Functionality**: 
  - Checks if user has a valid token
  - Redirects to login if not authenticated
  - Stores attempted URL for post-login redirect

### 2. RoleGuard (`role.guard.ts`)
- **Purpose**: Controls access based on user roles
- **Functionality**:
  - Checks user roles against required roles
  - Redirects to appropriate dashboard based on user's role
  - Works in conjunction with AuthGuard

### 3. LoginGuard (`login.guard.ts`)
- **Purpose**: Prevents authenticated users from accessing login pages
- **Functionality**:
  - Redirects authenticated users to their appropriate dashboard
  - Allows access to login pages only for unauthenticated users

## Enhanced AuthService

The `AuthService` has been enhanced with the following features:

### New Methods:
- `isAuthenticated()` - Check if user is authenticated
- `getUserRoles()` - Get user roles from localStorage
- `getToken()` - Get current user token
- `setAuthData(token, roles)` - Set authentication data after login
- `hasRole(role)` - Check if user has specific role
- `hasAnyRole(roles)` - Check if user has any of the specified roles
- `logout()` - Logout user and clear storage

### Token Validation:
- Basic JWT token structure validation
- Token expiration checking
- Automatic logout on token expiration

## Route Configuration

### Public Routes (No Authentication Required):
- `/login` - Login page
- `/forget-password` - Password reset request
- `/otp-password` - OTP verification
- `/reset-password` - Password reset

### Protected Routes (Authentication Required):
- `/dashboard/*` - All dashboard routes

### Role-based Access:
- **Admin Routes**: `/dashboard/admin/*`
  - Accessible by: Admin, Customer
  - Includes: home, countries, cities, addLead, filterLeads, dashboardnew

- **Customer Routes**: `/dashboard/customer`
  - Accessible by: Customer only

- **Employee Routes**: `/dashboard/employee`
  - Accessible by: Employee only

## Interceptors

### 1. AuthTokenInterceptor
- Automatically adds Bearer token to HTTP requests
- Excludes static assets and HTML files

### 2. AuthErrorInterceptor
- Handles HTTP 401/403 errors globally
- Automatically logs out users on authentication errors

## Usage Examples

### Protecting a Route:
```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['Admin'] }
}
```

### Checking Authentication in Component:
```typescript
constructor(private authService: AuthService) {}

ngOnInit() {
  if (this.authService.isAuthenticated()) {
    // User is logged in
  }
  
  if (this.authService.hasRole('Admin')) {
    // User is an admin
  }
}
```

### Manual Logout:
```typescript
this.authService.logout();
```

## Security Features

1. **Token Expiration**: Automatic logout when token expires
2. **Role Validation**: Server-side role validation on each request
3. **Route Protection**: Guards prevent unauthorized access
4. **Automatic Redirects**: Users are redirected to appropriate pages
5. **Error Handling**: Graceful handling of authentication errors

## Best Practices

1. **Always use guards** for protected routes
2. **Check authentication** before making API calls
3. **Handle logout** gracefully in components
4. **Use role-based guards** for sensitive operations
5. **Test with different user roles** to ensure proper access control

## Troubleshooting

### Common Issues:
1. **Infinite redirect loops**: Check guard logic and route configuration
2. **Token not found**: Ensure token is properly stored after login
3. **Role access denied**: Verify user roles and route data configuration
4. **Logout not working**: Check if AuthService.logout() is called properly

### Debug Tips:
- Check browser console for guard-related messages
- Verify token validity in localStorage
- Check user roles in localStorage
- Test with different user accounts and roles
