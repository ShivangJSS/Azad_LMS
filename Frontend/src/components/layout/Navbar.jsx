import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import Header from "./Header";

const menuItems = [
    { label: "Dashboard", dropdown: false, href: "/dashboard" },
    {
        label: "Courses",
        dropdown: true,
        items: [
            { label: "All Courses", href: "/courses" },
            { label: "Add Course", href: "/courses/add" },
            { label: "Course Categories", href: "/courses/categories" },
        ],
    },
    {
        label: "Modules Management",
        dropdown: true,
        items: [
            { label: "All Modules", href: "/modules" },
            { label: "Add Module", href: "/modules/add" },
        ],
    },
    {
        label: "Centres",
        dropdown: true,
        items: [
            { label: "All Centres", href: "/centres" },
            { label: "Add Centre", href: "/centres/add" },
        ],
    },
    {
        label: "Batch",
        dropdown: true,
        items: [
            { label: "All Batches", href: "/batches" },
            { label: "Add Batch", href: "/batches/add" },
        ],
    },
    {
        label: "Master",
        dropdown: true,
        items: [
            { label: "State", href: "/master/states" },
            { label: "District", href: "/master/districts" },
            { label: "Designation", href: "/master/designations" },
        ],
    },
    {
        label: "User Management",
        dropdown: true,
        items: [
            { label: "All Users", href: "/users" },
            { label: "Add User", href: "/users/add" },
            { label: "Roles & Permissions", href: "/users/roles" },
        ],
    },
    {
        label: "Document Management",
        dropdown: true,
        items: [
            { label: "All Documents", href: "/documents" },
            { label: "Upload Document", href: "/documents/upload" },
        ],
    },
    {
        label: "Assessment",
        dropdown: true,
        items: [
            { label: "All Assessments", href: "/assessments" },
            { label: "Add Assessment", href: "/assessments/add" },
        ],
    },
];

// Dropdown component for reuse
const NavDropdown = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Desktop: hover */}
            <div className="hidden lg:block group">
                <Link
                    to="#"
                    className="text-white font-semibold text-sm px-3 py-2 rounded-md hover:bg-purple-800 flex items-center"
                >
                    {item.label} <FaAngleDown className="ml-1" />
                </Link>
                <div className="absolute z-10 -ml-4 mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    {item.items.map((sub) => (
                        <Link
                            key={sub.label}
                            to={sub.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-800"
                        >
                            {sub.label}
                        </Link>
                    ))}
                </div>
            </div>
            {/* Mobile: click */}
            <div className="lg:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center text-white font-semibold text-sm px-3 py-2 rounded-md hover:bg-purple-800"
                >
                    <span>{item.label}</span>
                    <FaAngleDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="pl-4 py-1">
                        {item.items.map((sub) => (
                            <Link
                                key={sub.label}
                                to={sub.href}
                                className="block px-3 py-2 text-sm text-gray-200 rounded-md hover:bg-purple-800 hover:text-white"
                            >
                                {sub.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Navbar() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();

    return (
        <nav className="flex-col border-t-2 border-purple-700">
            <Header isMenuOpen={isMenuOpen} toggleMenu={() => setMenuOpen(!isMenuOpen)} />
            <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:block w-full bg-purple-700`} style={{ backgroundColor: '#7e2081' }}>
                <div className="container-fluid mx-auto px-4">
                    <div className="lg:flex lg:flex-wrap lg:py-0 py-2">
                        {menuItems.map((item) =>
                            item.dropdown ? (
                                <NavDropdown item={item} key={item.label} />
                            ) : (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    className={`text-white font-semibold text-sm px-3 py-3 rounded-md hover:bg-purple-800 ${pathname === item.href ? 'bg-purple-800' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}