import React from "react";
import AppRoutes from "@/routes/AppRoutes";
import GlobalLoader from "@/components/common/GlobalLoader";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <div className="relative min-h-screen bg-[#edf2f9]">
            <div className="relative z-10">
                <GlobalLoader />
                <AppRoutes />
                <Toaster position="top-center" />
            </div>
        </div>
    );
}

export default App;