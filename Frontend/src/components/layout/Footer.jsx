import React from 'react';

export default function Footer() {
    return (
        <footer className="relative py-3 mt-3" style={{ backgroundColor: '#732269' }}>
            <div className="container-fluid mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                        <p className="mb-0 text-white">© 2025 Azad Foundation. All Rights Reserved.</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="mb-0 text-white">
                            Powered by: <a href="https://www.indevconsultancy.com/" className="text-blue-300 hover:text-blue-200" target="_blank" rel="noopener noreferrer">Indev Consultancy Pvt. Ltd.</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}