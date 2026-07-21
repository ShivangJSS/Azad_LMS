import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/authentication/Login";
import ForgotPassword from "../features/authentication/ForgotPassword";
import Dashboard from "../features/dashboard/Dashboard";
import NotFound from "../features/authentication/NotFound";
import ProtectedRoute from "./ProtectedRoutes";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/Login" replace />} />
            <Route path="/Login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/NotFound" element={<NotFound />} />
            <Route path="/dashboard" element={<ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}