import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logos/logo.svg";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-r from-[#efe8ff] via-[#f8f5ff] to-[#ddd3ff] font-['Poppins',sans-serif]">

            {/* Header */}
            <header className="bg-white p-4 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="inline-flex items-center"
                    >
                        <img
                            src={logo}
                            alt="Azad Foundation Logo"
                            className="h-8 w-auto"
                        />
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex flex-1 items-center justify-center px-4 py-8">
                <section className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl sm:p-8">

                    <h1 className="text-6xl font-bold text-[#7e2081] md:text-9xl">
                        404
                    </h1>

                    <h2 className="mt-4 text-2xl font-semibold text-gray-800 md:text-3xl">
                        Page Not Found
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Sorry, the page you are looking for could not be found.
                    </p>

                    <Link
                        to="/dashboard"
                        className="mt-6 inline-flex items-center justify-center rounded-md bg-[#7e2081] px-6 py-3 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-[#6a1c6d] focus:outline-none focus:ring-2 focus:ring-[#7e2081] focus:ring-offset-2"
                    >
                        Go to Dashboard
                    </Link>

                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}