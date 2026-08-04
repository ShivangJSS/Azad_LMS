import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
    children,
    allowedRoles,
}) {
    const location = useLocation();

    const token = localStorage.getItem("access_token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Permission check
    if (allowedRoles) {
        const userPermissions = JSON.parse(
            localStorage.getItem("permissions") || "[]"
        );

        const hasPermission = userPermissions.includes(allowedRoles);

        if (!hasPermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
}