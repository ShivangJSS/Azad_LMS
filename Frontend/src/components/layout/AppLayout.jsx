import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GlobalLoader from "../common/GlobalLoader";

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#edf2f9] flex flex-col">

            <GlobalLoader />

            <Navbar />

            <main className="grow container-fluid mx-auto px-3 pb-3 pt-[118px] md:pb-4 lg:pt-[122px]">
                {children}
            </main>

            <Footer />

        </div>
    );
}