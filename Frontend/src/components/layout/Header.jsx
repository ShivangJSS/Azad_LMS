import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FaUserCog, FaKey, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import logo from "../../assets/logos/logo.svg";
import avatar from "../../assets/img/team/avatar.png";

export default function Header({ isMenuOpen, toggleMenu }) {
    const [isProfileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.log(err);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            navigate("/Login");
        }
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileRef]);

    return (
        <div className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="relative h-[60px] flex items-center justify-between px-3">

                <div className="flex items-center">
                    <button onClick={toggleMenu} className="lg:hidden  rounded text-gray-600 hover:text-gray-800 hover:bg-gray-100">
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <Link to="/dashboard">
                        <img
                            src={logo}
                            alt="Azad Foundation"
                            className="h-11 w-auto "
                        />
                    </Link>
                </div>

                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#344050] hidden md:block">
                    LMS Dashboard
                </p>
                <div className="flex items-center space-x-4">
                    <div className="text-right hidden md:block">
                        <strong className="block text-sm font-medium text-gray-900">Super Admin</strong>
                        <small className="text-xs text-gray-500">Super Admin</small>
                    </div>
                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center focus:outline-none">
                            <img
                                src={avatar}
                                className="h-10 w-10 rounded-full shadow-sm"
                                alt="User Avatar"
                            />
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <Link to="#profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FaUserCog className="mr-2" /> Profile
                                </Link>
                                <Link to="#change-password" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FaKey className="mr-2" /> Change Password
                                </Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <a href="#" onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                    <FaSignOutAlt className="mr-2" /> Logout
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}