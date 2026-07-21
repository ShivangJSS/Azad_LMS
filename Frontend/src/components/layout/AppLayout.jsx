import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#edf2f9' }}>
            <Navbar />
            <main className="flex-grow container-fluid mx-auto px-4 py-3 md:py-4">
                {children}
            </main>
            <Footer />
        </div>
    );
}