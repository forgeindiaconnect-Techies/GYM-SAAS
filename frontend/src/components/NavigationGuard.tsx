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
      return (
        ['/', '/login', '/forgot-password', '/status', '/gym-owner-introduction', '/subscription-plans'].includes(p) ||
        p.startsWith('/register') ||
        p.startsWith('/invite') ||
        p.startsWith('/marketplace')
      );
    };

    const isCurrentPublic = isPublicPath(currentPath);

    // If user is not authenticated, only allow public routes
    if (!isAuthenticated || !user) {
      if (!isCurrentPublic) {
        navigate('/login', { replace: true });
      }
      return;
    }

    // If authenticated user visits public login or root page, navigate to their dashboard
    if (currentPath === '/login' || currentPath === '/') {
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

    if (isSamePath || isRecentAuthorizedNav || cameFromPublic) {
      // Authorized navigation via button/link/menu, login transition, or same page refresh
      sessionStorage.setItem(ACTIVE_PATH_KEY, currentPath);
      sessionStorage.removeItem(NAV_PERMITTED_KEY);
      sessionStorage.removeItem(NAV_TIMESTAMP_KEY);
    } else if (savedActivePath && !isRecentAuthorizedNav && !cameFromPublic) {
      // Manual address bar URL modification detected while inside a dashboard
      // Keep the user on their previously active dashboard page as required by Bug 6
      navigate(savedActivePath, { replace: true });
    } else {
      sessionStorage.setItem(ACTIVE_PATH_KEY, currentPath);
    }
  }, [location.pathname, isAuthenticated, user, isLoading, navigate]);

  return null;
};

export default NavigationGuard;
