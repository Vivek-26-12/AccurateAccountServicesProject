import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Data/AuthData';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user } = useAuth();

    // If user is not logged in, redirect to Home
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // If roles are specified and user's role is not included, redirect to Home
    // (You might want a generic "Unauthorized" page, but Home is safe for now)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
