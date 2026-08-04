import { Navigate, Outlet, useLocation } from "react-router-dom";

import { hasPermission } from "../../config/permissions";

export default function ProtectedRoute({ allowedRoles, children }) {
    const location = useLocation();
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("userRole");

    if (!token) {
        return <Navigate to="/Login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !hasPermission(allowedRoles, role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ?? <Outlet />;
}
