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
import DistrictList from "../features/master/district/pages/DistrictList";
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
import ParticipantEdit from "../features/participant/pages/ParticipantEdit";
import ParticipantViewReport from "../features/participant/pages/ParticipantViewReport";

//Batches
import BatchList from "../features/batch/pages/BatchList";
import BatchCreate from "../features/batch/pages/BatchCreate";
import BatchEdit from "../features/batch/pages/BatchEdit";
import BatchView from "../features/batch/pages/BatchView";

//ListModule
import ListModule from "../features/module/ListModule/pages/ListModule";
import AddModules from "../features/module/ListModule/pages/AddModules";
import ViewModule from "../features/module/ListModule/pages/ViewModule";
import EditModule from "../features/module/ListModule/pages/EditModules";
import ConfigureModule from "../features/module/ListModule/pages/ConfigureModule";
import ViewModuleContent from "../features/module/ListModule/pages/ViewModuleContent";

// PDF Master
import PdfList from "../features/document/pdf/pages/PdfList";
import AddPdf from "../features/document/pdf/pages/AddPdf";
import ViewPdf from "../features/document/pdf/pages/ViewPdf";
import EditPdf from "../features/document/pdf/pages/EditPdf";

// PPT Master
import PptList from "../features/document/ppt/pages/PptList";
import AddPpt from "../features/document/ppt/pages/AddPpt";
import ViewPpt from "../features/document/ppt/pages/ViewPpt";
import EditPpt from "../features/document/ppt/pages/EditPpt";

// Video Master
import VideoList from "../features/document/video/pages/VideoList";
import AddVideo from "../features/document/video/pages/AddVideo";
import ViewVideo from "../features/document/video/pages/ViewVideo";
import EditVideo from "../features/document/video/pages/EditVideo";

//Topic
import TopicList from "../features/module/Topic/pages/TopicList";
import AddTopic from "../features/module/Topic/pages/AddTopic";
import EditTopic from "../features/module/Topic/pages/EditTopic";
import ViewTopic from "../features/module/Topic/pages/ViewTopic";

//MCQ
import MCQList from "../features/assessment/MCQ/pages/MCQList";
import MCQAdd from "../features/assessment/MCQ/pages/MCQAdd";
import MCQView from "../features/assessment/MCQ/pages/MCQView";
import MCQEdit from "../features/assessment/MCQ/pages/MCQEdit";


//SCQ
import SCQList from "../features/assessment/SCQ/pages/SCQList";
import SCQAdd from "../features/assessment/SCQ/pages/SCQAdd";
import SCQView from "../features/assessment/SCQ/pages/SCQView";
import SCQEdit from "../features/assessment/SCQ/pages/SCQEdit";

//DropBucket
import DropBucketList from "../features/assessment/DropBucket/pages/DropBucketList";
import DropBucketAdd from "../features/assessment/DropBucket/pages/AddDropBucket";
import ViewDropBucket from "../features/assessment/DropBucket/pages/ViewDropBucket";
import EditDropBucket from "../features/assessment/DropBucket/pages/EditDropBucket";

//DROP BUCKET ITEM
import ViewBucketItemsModal from "../features/assessment/DropBucket/pages/ViewBucketItems";
import EditBucketItems from "../features/assessment/DropBucket/pages/EditBucketItems";

//MATCH MAKING
import MatchMakingList from "../features/assessment/MatchMaking/pages/MatchMakingList";
import MatchMakingAdd from "../features/assessment/MatchMaking/pages/MatchMakingAdd";
import MatchMakingView from "../features/assessment/MatchMaking/pages/MatchMakingView";
import MatchMakingEdit from "../features/assessment/MatchMaking/pages/MatchMakingEdit";

//LEFT ITEMS
import LeftItemList from "../features/assessment/MatchMaking/pages/LeftItem/LeftItemList";
import LeftItemAdd from "../features/assessment/MatchMaking/pages/LeftItem/LeftItemAdd";

//Right ITEMS
import RightItemList from "../features/assessment/MatchMaking/pages/RightItem/RightItemList";
import RightItemAdd from "../features/assessment/MatchMaking/pages/RightItem/RightItemAdd";

//Correct Answers
import CorrectAnswer from "../features/assessment/MatchMaking/pages/CorrectAnswer/CorrectAnswer";
import CorrectAnswerAdd from "../features/assessment/MatchMaking/pages/CorrectAnswer/CorrectAnswerAdd";
import CorrectAnswerEdit from "../features/assessment/MatchMaking/pages/CorrectAnswer/CorrectAnswerEdit";


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

            {/* PDF Master */}
            <Route
                path="/pdf-masters"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <PdfList />
                    </Protected>
                }
            />

            <Route
                path="/pdf-masters/create"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <AddPdf />
                    </Protected>
                }
            />

            <Route
                path="/pdf-masters/edit/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <EditPdf />
                    </Protected>
                }
            />

            <Route
                path="/pdf-masters/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <ViewPdf />
                    </Protected>
                }
            />

            {/* PPT Master */}
            <Route
                path="/ppt-masters"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <PptList />
                    </Protected>
                }
            />

            <Route
                path="/ppt-masters/create"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <AddPpt />
                    </Protected>
                }
            />

            <Route
                path="/ppt-masters/edit/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <EditPpt />
                    </Protected>
                }
            />

            <Route
                path="/ppt-masters/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <ViewPpt />
                    </Protected>
                }
            />

            {/* Video Master */}
            <Route
                path="/video-masters"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <VideoList />
                    </Protected>
                }
            />

            <Route
                path="/video-masters/create"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <AddVideo />
                    </Protected>
                }
            />

            <Route
                path="/video-masters/edit/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <EditVideo />
                    </Protected>
                }
            />

            <Route
                path="/video-masters/:id"
                element={
                    <Protected permission={permissions.DocumentManagement}>
                        <ViewVideo />
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

            <Route
                path="/participants/:id/edit"
                element={
                    <Protected permission={permissions.ParticipantManagement}>
                        <ParticipantEdit />
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

            {/* Module Management */}

            <Route
                path="/topic-master"
                element={
                    <Protected permission={permissions.Topic}>
                        <TopicList />
                    </Protected>
                }
            />
            <Route
                path="/topic-master/add"
                element={
                    <Protected permission={permissions.Topic}>
                        <AddTopic />
                    </Protected>
                }
            />

            <Route
                path="/topic-master/:topicId"
                element={
                    <Protected permission={permissions.Topic}>
                        <ViewTopic />
                    </Protected>
                }
            />

            <Route
                path="/topic-master/edit/:topicId"
                element={
                    <Protected permission={permissions.Topic}>
                        <EditTopic />
                    </Protected>
                }
            />

            <Route
                path="/modules"
                element={
                    <Protected permission={permissions.Topic}>
                        <ListModule />
                    </Protected>
                }
            />

            <Route
                path="/module-master/add"
                element={
                    <Protected permission={permissions.Module}>
                        <AddModules />
                    </Protected>
                }
            />

            <Route
                path="/module-master/:moduleId"
                element={
                    <Protected permission={permissions.Module}>
                        <ViewModule />
                    </Protected>
                }
            />

            <Route
                path="/module-master/edit/:moduleId"
                element={
                    <Protected permission={permissions.Module}>
                        <EditModule />
                    </Protected>
                }
            />

            <Route
                path="/module-master/configure/:moduleId"
                element={
                    <Protected permission={permissions.Module}>
                        <ConfigureModule />
                    </Protected>
                }
            />

            <Route
                path="/module-master/configure/:moduleId/content/:docId"
                element={
                    <Protected permission={permissions.Module}>
                        <ViewModuleContent />
                    </Protected>
                }
            />
            
            <Route
                path="/mcq-master"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MCQList />
                    </Protected>
                }
            />
            <Route
                path="/mcq-master/create"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MCQAdd />
                    </Protected>
                }
            />

            <Route
                path="/mcq-master/:parentId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MCQView />
                    </Protected>
                }
            />

            <Route
                path="/mcq-master/edit/:mcqId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MCQEdit />
                    </Protected>
                }
            />

            <Route
                path="/scq-master"
                element={
                    <Protected permission={permissions.Assessment}>
                        <SCQList />
                    </Protected>
                }
            />

            <Route
                path="/scq-master/create"
                element={
                    <Protected permission={permissions.Assessment}>
                        <SCQAdd />
                    </Protected>
                }
            />
            <Route
                path="/scq-master/:parentId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <SCQView />
                    </Protected>
                }
            />

            <Route
                path="/scq-master/edit/:scqId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <SCQEdit />
                    </Protected>
                }
            />

            <Route
                path="/drop-bucket-master"
                element={
                    <Protected permission={permissions.Assessment}>
                        <DropBucketList />
                    </Protected>
                }
            />
            <Route
                path="/drop-bucket-master/create"
                element={
                    <Protected permission={permissions.Assessment}>
                        <DropBucketAdd />
                    </Protected>
                }
            />
            <Route
                path="/drop-bucket-master/view/:parentId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <ViewDropBucket />
                    </Protected>
                }
            />

            <Route
                path="/drop-bucket-master/edit/:parentId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <EditDropBucket />
                    </Protected>
                }
            />

            <Route
                path="/drop-bucket-master/items/edit/:dropBucketId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <EditBucketItems />
                    </Protected>
                }
            />

            <Route
                path="/drop-bucket-master/items/:dropBucketItemId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <ViewBucketItemsModal />
                    </Protected>
                }
            />


            //MATCH MAKING

            <Route
                path="/match-making-master"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MatchMakingList />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/create"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MatchMakingAdd />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/:parentId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MatchMakingView />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/edit/:matchMakingId"
                element={
                    <Protected permission={permissions.Assessment}>
                        <MatchMakingEdit />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/:matchMakingId/left-items"
                element={
                    <Protected permission={permissions.Assessment}>
                        <LeftItemList />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/:matchMakingId/left-items/add"
                element={
                    <Protected permission={permissions.Assessment}>
                        <LeftItemAdd />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/:matchMakingId/right-items"
                element={
                    <Protected permission={permissions.Assessment}>
                        <RightItemList />
                    </Protected>
                }
            />


            <Route
                path="/match-making-master/:matchMakingId/right-items/add"
                element={
                    <Protected permission={permissions.Assessment}>
                        <RightItemAdd />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/:matchMakingId/correct-answers"
                element={
                    <Protected permission={permissions.Assessment}>
                        <CorrectAnswer />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/:matchMakingId/correct-answers/add"
                element={
                    <Protected permission={permissions.Assessment}>
                        <CorrectAnswerAdd />
                    </Protected>
                }
            />

            <Route
                path="/match-making-master/:matchMakingId/correct-answers/edit"
                element={
                    <Protected permission={permissions.Assessment}>
                        <CorrectAnswerEdit />
                    </Protected>
                }
            />

            {/* 404 */}

            <Route path="*" element={<NotFound />} />

        </Routes>
    );
}