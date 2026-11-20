import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute, isSubscriptionActive } from '../utils/routeHelpers';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireSubscription?: boolean;
}

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

const ProtectedRoute = ({ children, allowedRoles, requireSubscription }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FDBA74] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={getLoginRedirect(location.pathname)} state={{ from: location.pathname }} replace />;
  }

  // Strict Role check
  const isMemberRole = user.role === 'MEMBER' || user.role === 'CUSTOMER';
  const roleMatches = allowedRoles ? (allowedRoles.includes(user.role) || (allowedRoles.includes('MEMBER') && isMemberRole)) : true;
  if (allowedRoles && !roleMatches) {
    // Customers must never access superadmin or gym admin routes; redirect to authorized dashboard
    return <Navigate to={getDashboardRoute(user)} replace />;
  }

  // Subscription & Approval gate for member dashboard
  if (requireSubscription && isMemberRole) {
    const statusUpper = (user.approvalStatus || '').toUpperCase().trim();
    const detailUpper = ((user.statusDetail || '') as string).toUpperCase().trim();

    if (detailUpper === 'INACTIVE' || statusUpper === 'INACTIVE' || statusUpper === 'SUSPENDED' || user.isActive === false) {
      return <Navigate to="/status?type=inactive" replace />;
    }
    if (detailUpper === 'REJECTED' || statusUpper === 'REJECTED') return <Navigate to="/status?type=rejected" replace />;
    if (detailUpper === 'PENDING' || detailUpper === 'NEW' || statusUpper === 'PENDING') {
      // Allow viewing their actual membership details page even while pending approval
      if (location.pathname === '/member/subscription') {
        return <>{children}</>;
      }
      return <Navigate to="/member/subscription" replace />;
    }
  }

  // Subscription & Approval gate for gym owner dashboard
  if (requireSubscription && (user.role === 'ADMIN' || user.role === 'GYM_OWNER')) {
    const statusUpper = (user.approvalStatus || '').toUpperCase().trim();
    const detailUpper = ((user.statusDetail || '') as string).toUpperCase().trim();

    if (detailUpper === 'REJECTED' || statusUpper === 'REJECTED') return <Navigate to="/status?type=rejected" replace />;
    if (detailUpper === 'INACTIVE' || statusUpper === 'INACTIVE' || statusUpper === 'SUSPENDED' || user.isActive === false) {
      return <Navigate to="/status?type=inactive" replace />;
    }
    
    if (!isSubscriptionActive(user.subscriptionStatus)) {
      return <Navigate to="/subscription-plans" replace />;
    }
    if (detailUpper === 'PENDING' || statusUpper === 'PENDING') return <Navigate to="/status?type=pending" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
