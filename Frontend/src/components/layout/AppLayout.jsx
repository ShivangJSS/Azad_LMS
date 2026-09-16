// import React from "react";
// import Navbar from "./Navbar";
// import Footer from "./Footer";

// export default function AppLayout({ children }) {
//     return (
//         <div className="min-h-screen w-full overflow-x-hidden bg-[#edf2f9] flex flex-col">

//             <Navbar />

//             <main className="grow container-fluid mx-auto px-3 pb-3 pt-[118px] md:pb-4 lg:pt-[122px]">
//                 {children}
//             </main>

//             <Footer />

//         </div>
//     );
// }
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

/* Warm the dashboard chunks (charts + map) once the shell is idle, so the
   dashboard paints instantly the first time it is opened. */
if (typeof window !== "undefined" && !window.__azadDashboardWarmed) {
    window.__azadDashboardWarmed = true;
    const warm = () => {
        import("@/features/dashboard/Dashboard");
        import("@/features/dashboard/components/DashboardCharts");
        import("@/features/dashboard/components/StateWiseCentresMap");
    };
    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(warm, { timeout: 1500 });
    } else {
        setTimeout(warm, 600);
    }
}

export default function AppLayout({ children }) {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#edf2f9] flex flex-col">
            {/* Ambient background layer: the existing brand colors at 4–7% opacity,
                heavily blurred, fixed behind the page. Purely decorative — it never
                receives pointer events and sits below the content (z-0 < z-10). */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute left-[-220px] top-[60px] h-[560px] w-[560px] rounded-full bg-[#732269]/7 blur-3xl" />
                <div className="absolute right-[-240px] top-[200px] h-[600px] w-[600px] rounded-full bg-[#00d4c7]/6 blur-3xl" />
                <div className="absolute bottom-[-260px] left-[28%] h-[620px] w-[620px] rounded-full bg-[#344050]/6 blur-3xl" />
                <div className="absolute bottom-[-200px] right-[16%] h-[440px] w-[440px] rounded-full bg-[#7e2081]/5 blur-3xl" />
                <div className="absolute left-[36%] top-[-220px] h-[500px] w-[500px] rounded-full bg-[#732269]/4 blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <Navbar />

                <main className="grow container-fluid mx-auto px-3 pb-3 pt-[80px] md:pb-4 lg:pt-[122px]">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}