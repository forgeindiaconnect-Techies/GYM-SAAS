import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute, isSubscriptionActive } from '../utils/routeHelpers';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireSubscription?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireSubscription }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user)} replace />;
  }

  // Subscription & Approval gate for member dashboard
  if (requireSubscription && user.role === 'MEMBER') {
    if (user.approvalStatus === 'PENDING') return <Navigate to="/status?type=pending" replace />;
    if (user.approvalStatus === 'REJECTED') return <Navigate to="/status?type=rejected" replace />;
    if (user.approvalStatus === 'SUSPENDED') return <Navigate to="/status?type=suspended" replace />;
    if (user.isActive === false) return <Navigate to="/status?type=inactive" replace />;
  }

  // Subscription & Approval gate for gym owner dashboard
  if (requireSubscription && (user.role === 'ADMIN' || user.role === 'GYM_OWNER')) {
    if (user.approvalStatus === 'PENDING') return <Navigate to="/status?type=pending" replace />;
    if (user.approvalStatus === 'REJECTED') return <Navigate to="/status?type=rejected" replace />;
    if (user.approvalStatus === 'SUSPENDED') return <Navigate to="/status?type=suspended" replace />;
    if (user.isActive === false) return <Navigate to="/status?type=inactive" replace />;
    
    if (user.approvalStatus === 'APPROVED') {
      if (!isSubscriptionActive(user.subscriptionStatus)) {
        return <Navigate to="/gym-owner/subscription" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
