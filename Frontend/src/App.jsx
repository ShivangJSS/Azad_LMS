import React from "react";
import AppRoutes from "./routes/AppRoutes";
import GlobalLoader from "./components/common/GlobalLoader";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <GlobalLoader />
            <AppRoutes />
            <Toaster position="top-center" />
        </>
    );
}

export default App;