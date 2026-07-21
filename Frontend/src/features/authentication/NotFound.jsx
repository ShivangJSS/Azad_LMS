import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/logos/logo.svg";
import Footer from "../../components/layout/Footer";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#efe8ff] via-[#f8f5ff] to-[#ddd3ff] font-['Poppins',sans-serif]">
            <header className="p-4 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/">
                        <img src={logo} alt="Azad Foundation Logo" className="h-8 w-auto" />
                    </Link>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
                    <h1 className="text-6xl md:text-9xl font-bold text-[#7e2081]">404</h1>
                    <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-800">Page Not Found</h2>
                    <p className="mt-2 text-gray-600">
                        Sorry, the page you are looking for could not be found.
                    </p>
                    <Link
                        to="/dashboard"
                        className="mt-6 inline-block px-6 py-3 text-sm font-medium text-white bg-[#7e2081] rounded-md hover:bg-[#6a1c6d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7e2081] transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}