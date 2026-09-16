import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
const LoginPage = lazy(() => import("@/features/authentication/Login"));
const ForgotPassword = lazy(() => import("@/features/authentication/ForgotPassword"));
const NotFound = lazy(() => import("@/features/authentication/NotFound"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const Disclaimer = lazy(() => import("@/pages/disclaimer_Azad_LMS"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy_policy_azad_LMS"));

// Dashboard
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));

// Auth
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { permissions } from "@/config/permissions";

// Users
const UserList = lazy(() => import("@/features/users/pages/UserList"));
const CreateUser = lazy(() => import("@/features/users/pages/CreateUser"));
const UserView = lazy(() => import("@/features/users/pages/UserView"));
const EditUser = lazy(() => import("@/features/users/pages/EditUser"));

// Centres
const CreateCenter = lazy(() => import("@/features/center/pages/CreateCenter"));
const CenterList = lazy(() => import("@/features/center/pages/CentreList"));
const CenterView = lazy(() => import("@/features/center/pages/CenterView"));
const EditCenter = lazy(() => import("@/features/center/pages/EditCenter"));

// States
const StateList = lazy(() => import("@/features/master/state/pages/StateList"));
const CreateState = lazy(() => import("@/features/master/state/pages/CreateState"));
const EditState = lazy(() => import("@/features/master/state/pages/EditState"));

// Districts
const DistrictList = lazy(() => import("@/features/master/district/pages/DistrictList"));
const CreateDistrict = lazy(() => import("@/features/master/district/pages/CreateDistrict"));
const EditDistrict = lazy(() => import("@/features/master/district/pages/EditDistrict"));

// Documents
const DocumentList = lazy(() => import("@/features/document/pages/DocumentList"));
const CreateDocument = lazy(() => import("@/features/document/pages/CreateDocument"));
const ViewDocument = lazy(() => import("@/features/document/pages/ViewDocument"));
const EditDocuments = lazy(() => import("@/features/document/pages/EditDocuments"));

//Courses
const CourseList = lazy(() => import("@/features/course/pages/CourseList"));
const CourseEdit = lazy(() => import("@/features/course/pages/CourseEdit"));
const CourseView = lazy(() => import("@/features/course/pages/CourseView"));

//Participants
const ParticipantList = lazy(() => import("@/features/participant/pages/ParticipantList"));
const ParticipantCreate = lazy(() => import("@/features/participant/pages/ParticipantCreate"));
const ParticipantEdit = lazy(() => import("@/features/participant/pages/ParticipantEdit"));
const ParticipantViewReport = lazy(() => import("@/features/participant/pages/ParticipantViewReport"));

//Batches
const BatchList = lazy(() => import("@/features/batch/pages/BatchList"));
const BatchCreate = lazy(() => import("@/features/batch/pages/BatchCreate"));
const BatchEdit = lazy(() => import("@/features/batch/pages/BatchEdit"));
const BatchView = lazy(() => import("@/features/batch/pages/BatchView"));

//ListModule
const ListModule = lazy(() => import("@/features/module/ListModule/pages/ListModule"));
const AddModules = lazy(() => import("@/features/module/ListModule/pages/AddModules"));
const ViewModule = lazy(() => import("@/features/module/ListModule/pages/ViewModule"));
const EditModule = lazy(() => import("@/features/module/ListModule/pages/EditModules"));
const ConfigureModule = lazy(() => import("@/features/module/ListModule/pages/ConfigureModule"));
const ViewModuleContent = lazy(() => import("@/features/module/ListModule/pages/ViewModuleContent"));

// PDF Master
const PdfList = lazy(() => import("@/features/document/pdf/pages/PdfList"));
const AddPdf = lazy(() => import("@/features/document/pdf/pages/AddPdf"));
const ViewPdf = lazy(() => import("@/features/document/pdf/pages/ViewPdf"));
const EditPdf = lazy(() => import("@/features/document/pdf/pages/EditPdf"));

// PPT Master
const PptList = lazy(() => import("@/features/document/ppt/pages/PptList"));
const AddPpt = lazy(() => import("@/features/document/ppt/pages/AddPpt"));
const ViewPpt = lazy(() => import("@/features/document/ppt/pages/ViewPpt"));
const EditPpt = lazy(() => import("@/features/document/ppt/pages/EditPpt"));

// Video Master
const VideoList = lazy(() => import("@/features/document/video/pages/VideoList"));
const AddVideo = lazy(() => import("@/features/document/video/pages/AddVideo"));
const ViewVideo = lazy(() => import("@/features/document/video/pages/ViewVideo"));
const EditVideo = lazy(() => import("@/features/document/video/pages/EditVideo"));

//Topic
const TopicList = lazy(() => import("@/features/module/Topic/pages/TopicList"));
const AddTopic = lazy(() => import("@/features/module/Topic/pages/AddTopic"));
const EditTopic = lazy(() => import("@/features/module/Topic/pages/EditTopic"));
const ViewTopic = lazy(() => import("@/features/module/Topic/pages/ViewTopic"));

//MCQ
const MCQList = lazy(() => import("@/features/assessment/MCQ/pages/MCQList"));
const MCQAdd = lazy(() => import("@/features/assessment/MCQ/pages/MCQAdd"));
const MCQView = lazy(() => import("@/features/assessment/MCQ/pages/MCQView"));
const MCQEdit = lazy(() => import("@/features/assessment/MCQ/pages/MCQEdit"));


//SCQ
const SCQList = lazy(() => import("@/features/assessment/SCQ/pages/SCQList"));
const SCQAdd = lazy(() => import("@/features/assessment/SCQ/pages/SCQAdd"));
const SCQView = lazy(() => import("@/features/assessment/SCQ/pages/SCQView"));
const SCQEdit = lazy(() => import("@/features/assessment/SCQ/pages/SCQEdit"));

//DropBucket
const DropBucketList = lazy(() => import("@/features/assessment/DropBucket/pages/DropBucketList"));
const DropBucketAdd = lazy(() => import("@/features/assessment/DropBucket/pages/AddDropBucket"));
const ViewDropBucket = lazy(() => import("@/features/assessment/DropBucket/pages/ViewDropBucket"));
const EditDropBucket = lazy(() => import("@/features/assessment/DropBucket/pages/EditDropBucket"));

//DROP BUCKET ITEM
const ViewBucketItemsModal = lazy(() => import("@/features/assessment/DropBucket/pages/ViewBucketItems"));
const EditBucketItems = lazy(() => import("@/features/assessment/DropBucket/pages/EditBucketItems"));

//MATCH MAKING
const MatchMakingList = lazy(() => import("@/features/assessment/MatchMaking/pages/MatchMakingList"));
const MatchMakingAdd = lazy(() => import("@/features/assessment/MatchMaking/pages/MatchMakingAdd"));
const MatchMakingView = lazy(() => import("@/features/assessment/MatchMaking/pages/MatchMakingView"));
const MatchMakingEdit = lazy(() => import("@/features/assessment/MatchMaking/pages/MatchMakingEdit"));

//LEFT ITEMS
const LeftItemList = lazy(() => import("@/features/assessment/MatchMaking/pages/LeftItem/LeftItemList"));
const LeftItemAdd = lazy(() => import("@/features/assessment/MatchMaking/pages/LeftItem/LeftItemAdd"));

//Right ITEMS
const RightItemList = lazy(() => import("@/features/assessment/MatchMaking/pages/RightItem/RightItemList"));
const RightItemAdd = lazy(() => import("@/features/assessment/MatchMaking/pages/RightItem/RightItemAdd"));

//Correct Answers
const CorrectAnswer = lazy(() => import("@/features/assessment/MatchMaking/pages/CorrectAnswer/CorrectAnswer"));
const CorrectAnswerAdd = lazy(() => import("@/features/assessment/MatchMaking/pages/CorrectAnswer/CorrectAnswerAdd"));
const CorrectAnswerEdit = lazy(() => import("@/features/assessment/MatchMaking/pages/CorrectAnswer/CorrectAnswerEdit"));






// Wrapper Component
const Protected = ({ permission, children }) => (
    <ProtectedRoute allowedRoles={permission}>
        {children}
    </ProtectedRoute>
);
export default function AppRoutes() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#edf2f9] text-[14px] text-[#344050]">
                    Loading...
                </div>
            }
        >
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

                <Route path="/disclaimer" element={<Disclaimer />} />

                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

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
        </Suspense>
    );
}