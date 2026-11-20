import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../utils/routeHelpers';

const NAV_PERMITTED_KEY = 'gymora_nav_permitted';
const NAV_TIMESTAMP_KEY = 'gymora_nav_timestamp';
const ACTIVE_PATH_KEY = 'gymora_active_path';

export const markAuthorizedNavigation = () => {
  try {
    sessionStorage.setItem(NAV_PERMITTED_KEY, 'true');
    sessionStorage.setItem(NAV_TIMESTAMP_KEY, String(Date.now()));
  } catch {}
};

/**
 * Global NavigationGuard
 * 1. Enforces that in-app navigation occurs only through authorized menus, buttons, links, and forms.
 *    If an authenticated user manually modifies the URL path in the address bar to switch dashboards,
 *    the app keeps the user on their previously active dashboard page.
 * 2. Preserves legitimate page refreshes (F5) so reload keeps the user on their current page.
 * 3. Never blocks legitimate authentication, login, or public-to-dashboard transitions.
 */
const NavigationGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isInitialMount = useRef(true);

  // Global listener to recognize authorized user navigation via menus, buttons, links, form submits, and Enter key
  useEffect(() => {
    const handleGlobalInteraction = () => {
      markAuthorizedNavigation();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        markAuthorizedNavigation();
      }
    };

    window.addEventListener('click', handleGlobalInteraction, true);
    window.addEventListener('submit', handleGlobalInteraction, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('click', handleGlobalInteraction, true);
      window.removeEventListener('submit', handleGlobalInteraction, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentPath = location.pathname;
    const isPublicPath = (p?: string | null) => {
      if (!p) return true;
      if (p.includes('/checkout')) return false;
      return (
        [
          '/',
          '/login',
          '/pay',
          '/qr-pay',
          '/forgot-password',
          '/status',
          '/gym-owner-introduction',
          '/subscription-plans',
          '/about',
          '/careers',
          '/jobs',
          '/contact',
          '/privacy',
          '/terms',
          '/cancellation-refund-policy'
        ].includes(p) ||
        p.startsWith('/gyms') ||
        p.startsWith('/register') ||
        p.startsWith('/invite') ||
        p.startsWith('/portal') ||
        p.startsWith('/trainers') ||
        p.startsWith('/training') ||
        p.startsWith('/blog') ||
        p.startsWith('/marketplace')
      );
    };

    const isCurrentPublic = isPublicPath(currentPath);

    const getLoginRedirect = (path: string): string => {
      if (path.startsWith('/super-admin')) {
        return '/login?portal=super-admin';
      }
      if (path.startsWith('/member')) {
        return '/login?portal=customer';
      }
      if (path.startsWith('/admin')) {
        return '/login?portal=gym-owner';
      }
      if (path.startsWith('/trainer')) {
        return '/login?portal=trainer';
      }
      return '/login';
    };

    // If user is not authenticated, only allow public routes
    if (!isAuthenticated || !user) {
      if (!isCurrentPublic) {
        navigate(getLoginRedirect(currentPath), { replace: true, state: { from: currentPath } });
      }
      return;
    }

    // Role-based route authorization check
    const isRoleAuthorizedForPath = (role?: string, path?: string): boolean => {
      if (!path) return true;
      const r = (role || '').toUpperCase();
      if (path.startsWith('/super-admin')) {
        return r === 'SUPER_ADMIN';
      }
      if (path.startsWith('/admin')) {
        return r === 'ADMIN' || r === 'GYM_OWNER' || r === 'GYM_MANAGER';
      }
      if (path.startsWith('/member')) {
        return r === 'MEMBER' || r === 'CUSTOMER';
      }
      if (path.startsWith('/trainer')) {
        return r === 'TRAINER';
      }
      return true; // shared or public paths
    };

    // If an authenticated user enters a cross-role path they are NOT authorized for
    // (e.g. customer entering /super-admin or /admin in URL), immediately redirect them to their dashboard
    if (!isRoleAuthorizedForPath(user.role, currentPath)) {
      const target = getDashboardRoute(user);
      sessionStorage.setItem(ACTIVE_PATH_KEY, target);
      navigate(target, { replace: true });
      return;
    }

    // If authenticated user visits public login page, redirect to their dashboard
    if (currentPath === '/login') {
      const target = getDashboardRoute(user);
      markAuthorizedNavigation();
      navigate(target, { replace: true });
      return;
    }

    const savedActivePath = sessionStorage.getItem(ACTIVE_PATH_KEY);
    const navPermitted = sessionStorage.getItem(NAV_PERMITTED_KEY);
    const navTimeStr = sessionStorage.getItem(NAV_TIMESTAMP_KEY);
    const navTime = navTimeStr ? parseInt(navTimeStr, 10) : 0;
    // Allow up to 30s window for async API login / transitions
    const isRecentAuthorizedNav = navPermitted === 'true' && (Date.now() - navTime < 30000);

    // Initial mount of the app session
    if (isInitialMount.current) {
      isInitialMount.current = false;
      sessionStorage.setItem(ACTIVE_PATH_KEY, currentPath);
      sessionStorage.removeItem(NAV_PERMITTED_KEY);
      sessionStorage.removeItem(NAV_TIMESTAMP_KEY);
      return;
    }

    const isSamePath = savedActivePath === currentPath;
    const cameFromPublic = isPublicPath(savedActivePath);

    const getRolePrefix = (role?: string) => {
      if (!role) return '';
      switch (role.toUpperCase()) {
        case 'MEMBER':
        case 'CUSTOMER': return '/member';
        case 'TRAINER': return '/trainer';
        case 'ADMIN':
        case 'GYM_OWNER':
        case 'GYM_MANAGER': return '/admin';
        case 'SUPER_ADMIN': return '/super-admin';
        default: return '';
      }
    };

    const rolePrefix = getRolePrefix(user?.role);
    const isWithinOwnDashboard = Boolean(rolePrefix && currentPath.startsWith(rolePrefix));

    if (isSamePath || isRecentAuthorizedNav || cameFromPublic || isCurrentPublic || isWithinOwnDashboard) {
      // Authorized navigation via button/link/menu, login transition, same page refresh, public route, or navigation within user's own dashboard
      sessionStorage.setItem(ACTIVE_PATH_KEY, currentPath);
      sessionStorage.removeItem(NAV_PERMITTED_KEY);
      sessionStorage.removeItem(NAV_TIMESTAMP_KEY);
    } else if (savedActivePath && !isRecentAuthorizedNav && !cameFromPublic && !isWithinOwnDashboard) {
      // Cross-role dashboard switching attempt detected (e.g. member manually modifying URL to switch to /admin or /super-admin)
      // Keep the user on their previously active dashboard page
      navigate(savedActivePath, { replace: true });
    } else {
      sessionStorage.setItem(ACTIVE_PATH_KEY, currentPath);
    }
  }, [location.pathname, isAuthenticated, user, isLoading, navigate]);

  return null;
};

export default NavigationGuard;
