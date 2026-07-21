import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("access_token");

    console.log("ProtectedRoute Token:", token);

    if (!token) {
        console.log("Redirecting to Login...");
        return <Navigate to="/Login" replace />;
    }

    console.log("Access Granted");
    return children;
}