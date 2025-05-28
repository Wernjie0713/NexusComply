import { usePage } from '@inertiajs/react';

export function useAuth() {
    const { auth, abilities } = usePage().props;
    const user = auth.user;

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
        isRegionalManager: () => {
            if (!abilities || !abilities.roles) return false;
            return abilities.roles.includes('regional-manager');
        },
        isOutletManager: () => {
            if (!abilities || !abilities.roles) return false;
            return abilities.roles.includes('outlet-manager');
        },
        // Check if user has a specific ability/permission
        can: (ability) => {
            if (!abilities || !abilities.permissions) return false;
            // Bouncer's can() method returns an object where keys are the permissions
            // and values are boolean
            return abilities.permissions[ability] === true;
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
        }
    };
} 