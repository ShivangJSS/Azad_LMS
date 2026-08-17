import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Main Question List Pages
import MCQList from './pages/MCQList';
import SCQList from './pages/SCQList';
import MatchMakingList from './pages/MatchMakingList';
import DropBucketList from './pages/DropBucketList';

// MCQ & SCQ Sub-Pages
import ViewMCQ from './pages/ViewMCQ';
import EditMCQ from './pages/EditMCQ';
import ViewSCQ from './pages/ViewSCQ';
import EditSCQ from './pages/EditSCQ';

// Drop Bucket Sub-Pages
import ViewDropBucket from './pages/ViewDropBucket';
import EditDropBucket from './pages/EditDropBucket';
import EditBucketItems from './pages/EditBucketItems';

// Match Making Sub-Pages
import ViewMatchMaking from './pages/ViewMatchMaking';
import EditMatchMaking from './pages/EditMatchMaking';
import MatchLeftItems from './pages/MatchLeftItems';
import MatchRightItems from './pages/MatchRightItems';
import MatchCorrectAnswers from './pages/MatchCorrectAnswers';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Default Route */}
        <Route index element={<Navigate to="/mcq" replace />} />

        {/* Main List Routes (Supporting both Singular & Plural URLs) */}
        <Route path="mcq" element={<MCQList />} />
        <Route path="mcqs" element={<MCQList />} />
        
        <Route path="scq" element={<SCQList />} />
        <Route path="scqs" element={<SCQList />} />
        
        <Route path="drop-bucket" element={<DropBucketList />} />
        <Route path="drop-buckets" element={<DropBucketList />} />
        
        <Route path="match-making" element={<MatchMakingList />} />
        <Route path="match-makings" element={<MatchMakingList />} />

        {/* MCQ Routes */}
        <Route path="/mcqs/add" element={<EditMCQ />} />
        <Route path="/mcqs/view/:id" element={<ViewMCQ />} />
        <Route path="/mcqs/edit/:id" element={<EditMCQ />} />

        {/* SCQ Routes */}
        <Route path="/scqs/add" element={<EditSCQ />} />
        <Route path="/scqs/view/:id" element={<ViewSCQ />} />
        <Route path="/scqs/edit/:id" element={<EditSCQ />} />

        {/* Drop Bucket Routes */}
        <Route path="/drop-buckets/add" element={<EditDropBucket />} />
        <Route path="/drop-buckets/view/:id" element={<ViewDropBucket />} />
        <Route path="/drop-buckets/edit/:id" element={<EditDropBucket />} />
        <Route path="/drop-buckets/edit-items/:id" element={<EditBucketItems />} />

        {/* Match Making Routes */}
        <Route path="/match-making/add" element={<EditMatchMaking />} />
        <Route path="/match-making/view/:id" element={<ViewMatchMaking />} />
        <Route path="/match-making/edit/:id" element={<EditMatchMaking />} />
        <Route path="/match-making/left-items/:id" element={<MatchLeftItems />} />
        <Route path="/match-making/right-items/:id" element={<MatchRightItems />} />
        <Route path="/match-making/correct-answers/:id" element={<MatchCorrectAnswers />} />
      </Route>
    </Routes>
  );
}

export default App;