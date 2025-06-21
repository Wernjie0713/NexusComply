import { usePage } from '@inertiajs/react';

export function useAuth() {
    const { auth, abilities } = usePage().props;
    const user = auth.user;

    // Define system roles
    const systemRoles = ['admin', 'manager', 'outlet-user'];

    // Role checking functions
    return {
        user,
        // Check if user has a specific role
        hasRole: (role) => {
            if (!abilities || !abilities.roles) return false;
            return abilities.roles.includes(role);
        },
        // Shorthand helpers for common roles
        isAdmin: () => {
            if (!abilities || !abilities.roles) return false;
            return abilities.roles.includes('admin');
        },
        isManager: () => {
            if (!abilities || !abilities.roles) return false;
            return abilities.roles.includes('manager');
        },
        isOutletUser: () => {
            if (!abilities || !abilities.roles) return false;
            return abilities.roles.includes('outlet-user');
        },
        // Check if user has a specific ability/permission
        can: (ability) => {
            if (!abilities || !abilities.permissions) return false;
            // Check if the ability exists in permissions
            return Object.prototype.hasOwnProperty.call(abilities.permissions, ability);
        },
        // Check if user has any of the given roles
        hasAnyRole: (roles) => {
            if (!abilities || !abilities.roles || !Array.isArray(roles)) return false;
            return roles.some(role => abilities.roles.includes(role));
        },
        // Check if user has all of the given roles
        hasAllRoles: (roles) => {
            if (!abilities || !abilities.roles || !Array.isArray(roles)) return false;
            return roles.every(role => abilities.roles.includes(role));
        },
        // Check if user has custom roles only
        hasCustomRole: () => {
            if (!abilities || !abilities.roles) return false;
            return abilities.roles.some(role => !systemRoles.includes(role));
        },
        // Check if user has only custom roles (no system roles)
        hasOnlyCustomRoles: () => {
            if (!abilities || !abilities.roles || abilities.roles.length === 0) return false;
            return abilities.roles.every(role => !systemRoles.includes(role));
        },
        // Get all custom roles
        getCustomRoles: () => {
            if (!abilities || !abilities.roles) return [];
            return abilities.roles.filter(role => !systemRoles.includes(role));
        },
        // Check multiple permissions at once
        canAny: (permissions) => {
            if (!abilities || !abilities.permissions || !Array.isArray(permissions)) return false;
            return permissions.some(permission =>
                Object.prototype.hasOwnProperty.call(abilities.permissions, permission)
            );
        },
        // Check if user has all specified permissions
        canAll: (permissions) => {
            if (!abilities || !abilities.permissions || !Array.isArray(permissions)) return false;
            return permissions.every(permission =>
                Object.prototype.hasOwnProperty.call(abilities.permissions, permission)
            );
        }
    };
}