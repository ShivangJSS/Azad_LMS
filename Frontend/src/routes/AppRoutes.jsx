import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import LoginPage from "../features/authentication/Login";
import ForgotPassword from "../features/authentication/ForgotPassword";
import NotFound from "../features/authentication/NotFound";
import Unauthorized from "../pages/Unauthorized";

// Dashboard
import Dashboard from "../features/dashboard/Dashboard";

// Auth
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { permissions } from "../config/permissions";

// Users
import UserList from "../features/users/pages/UserList";
import CreateUser from "../features/users/pages/CreateUser";
import UserView from "../features/users/pages/UserView";
import EditUser from "../features/users/pages/EditUser";

// Centres
import CreateCenter from "../features/center/pages/CreateCenter";
import CenterList from "../features/center/pages/CentreList";
import CenterView from "../features/center/pages/CenterView";
import EditCenter from "../features/center/pages/EditCenter";

// States
import StateList from "../features/master/state/pages/StateList";
import CreateState from "../features/master/state/pages/CreateState";
import EditState from "../features/master/state/pages/EditState";

// Districts
import DistrictList from "../features/master/district/pages/DistrcitList";
import CreateDistrict from "../features/master/district/pages/CreateDistrict";
import EditDistrict from "../features/master/district/pages/EditDistrict";

// Documents
import DocumentList from "../features/document/pages/DocumentList";
import CreateDocument from "../features/document/pages/CreateDocument";
import ViewDocument from "../features/document/pages/ViewDocument";
import EditDocuments from "../features/document/pages/EditDocuments";

//Courses
import CourseList from "../features/course/pages/CourseList";
import CourseEdit from "../features/course/pages/CourseEdit";
import CourseView from "../features/course/pages/CourseView";


//Participants
import ParticipantList from "../features/participant/pages/ParticipantList";
import ParticipantCreate from "../features/participant/pages/ParticipantCreate";
import ParticipantViewReport from "../features/participant/pages/ParticipantViewReport";



//Batches
import BatchList from "../features/batch/pages/BatchList";
import BatchCreate from "../features/batch/pages/BatchCreate";
import BatchEdit from "../features/batch/pages/BatchEdit";
import BatchView from "../features/batch/pages/BatchView";

// Wrapper Component
const Protected = ({ permission, children }) => (
    <ProtectedRoute allowedRoles={permission}>
        {children}
    </ProtectedRoute>
);

export default function AppRoutes() {
    return (
        <Routes>

            {/* Public Routes */}

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Dashboard */}

            <Route
                path="/dashboard"
                element={
                    <Protected permission={permissions.Dashboard}>
                        <Dashboard />
                    </Protected>
                }
            />

            {/* User Management */}

            <Route
                path="/users/create"
                element={
                    <Protected permission={permissions.CreateUser}>
                        <CreateUser />
                    </Protected>
                }
            />

            <Route
                path="/users/userlist"
                element={
                    <Protected permission={permissions.CreateUser}>
                        <UserList />
                    </Protected>
                }
            />

            <Route
                path="/users/view/:id"
                element={
                    <Protected permission={permissions.CreateUser}>
                        <UserView />
                    </Protected>
                }
            />

            <Route
                path="/users/edit/:id"
                element={
                    <Protected permission={permissions.CreateUser}>
                        <EditUser />
                    </Protected>
                }
            />

            {/* Centre Management */}

            <Route
                path="/centres/create"
                element={
                    <Protected permission={permissions.Centres}>
                        <CreateCenter />
                    </Protected>
                }
            />

            <Route
                path="/centres/list"
                element={
                    <Protected permission={permissions.Centres}>
                        <CenterList />
                    </Protected>
                }
            />

            <Route
                path="/centres/:id"
                element={
                    <Protected permission={permissions.Centres}>
                        <CenterView />
                    </Protected>
                }
            />

            <Route
                path="/centres/edit/:id"
                element={
                    <Protected permission={permissions.Centres}>
                        <EditCenter />
                    </Protected>
                }
            />

            {/* State Management */}

            <Route
                path="/master/states"
                element={
                    <Protected permission={permissions.Master}>
                        <StateList />
                    </Protected>
                }
            />

            <Route
                path="/master/states/create"
                element={
                    <Protected permission={permissions.Master}>
                        <CreateState />
                    </Protected>
                }
            />

            <Route
                path="/master/states/edit/:state_lgd_code"
                element={
                    <Protected permission={permissions.Master}>
                        <EditState />
                    </Protected>
                }
            />

            {/* District Management */}

            <Route
                path="/master/districts"
                element={
                    <Protected permission={permissions.Master}>
                        <DistrictList />
                    </Protected>
                }
            />

            <Route
                path="/master/districts/create"
                element={
                    <Protected permission={permissions.Master}>
                        <CreateDistrict />
                    </Protected>
                }
            />

            <Route
                path="/master/districts/edit/:code"
                element={
                    <Protected permission={permissions.Master}>
                        <EditDistrict />
                    </Protected>
                }
            />

            {/* Document Management */}

            <Route
                path="/documents"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <DocumentList />
                    </Protected>
                }
            />

            <Route
                path="/documents/create"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <CreateDocument />
                    </Protected>
                }
            />

            <Route
                path="/documents/edit/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <EditDocuments />
                    </Protected>
                }
            />

            <Route
                path="/documents/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <ViewDocument />
                    </Protected>
                }
            />

            {/* Course Management */}
            <Route
                path="/courses"
                element={
                    <Protected permission={permissions.Dashboard}>
                        <CourseList />
                    </Protected>
                }
            />
            <Route
                path="/courses/view/:id"
                element={
                    <Protected permission={permissions.Dashboard}>
                        <CourseView />
                    </Protected>
                }
            />
            <Route
                path="/courses/edit/:id"
                element={
                    <Protected permission={permissions.Dashboard}>
                        <CourseEdit />
                    </Protected>
                }
            />


            {/* Participant Management */}
            <Route
                path="/participants/list"
                element={
                    <Protected permission={permissions.ParticipantManagement}>
                        <ParticipantList />
                    </Protected>
                }
            />

            <Route
                path="/participants/create"
                element={
                    <Protected permission={permissions.ParticipantManagement}>
                        <ParticipantCreate />
                    </Protected>
                }
            />

            <Route
                path="/participants/view/:id"
                element={
                    <Protected permission={permissions.ParticipantManagement}>
                        <ParticipantViewReport />
                    </Protected>
                }
            />


            {/* Batch Management */}
            <Route
                path="/batches/list"
                element={
                    <Protected permission={permissions.Batch}>
                        <BatchList />
                    </Protected>
                }
            />

            <Route
                path="/batches/create"
                element={
                    <Protected permission={permissions.Batch}>
                        <BatchCreate />
                    </Protected>
                }
            />

            <Route
                path="/batches/:batchId/edit"
                element={
                    <Protected permission={permissions.Batch}>
                        <BatchEdit />
                    </Protected>
                }
            />
            <Route
                path="/batches/:batchId/participants"
                element={
                    <Protected permission={permissions.Batch}>
                        <BatchView />
                    </Protected>
                }
            />
            {/* 404 */}

            <Route path="*" element={<NotFound />} />

        </Routes>
    );
}