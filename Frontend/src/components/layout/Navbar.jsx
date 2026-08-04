import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaBars,
    FaTimes,
    FaCrown,
    FaSignOutAlt,
    FaCaretDown,
} from "react-icons/fa";

import logo from "../../assets/logos/logo.svg";
import avatar from "../../assets/img/team/avatar.png";
import { hasPermission, permissions } from "../../config/permissions";


const menuItems = [
    {
        label: "Dashboard",
        dropdown: false,
        href: "/dashboard",
        allowedRoles: permissions.Dashboard,
    },
    {
        label: "Courses",
        dropdown: true,
        items: [
            { label: "Courses", href: "/courses", allowedRoles: permissions.Dashboard },
        ],
    },
    {
        label: "Modules Management",
        dropdown: true,
        items: [
            { label: "List Modules", href: "/modules", allowedRoles: permissions.ModuleManagement },
            { label: "Topic Master", href: "/topic-master", allowedRoles: permissions.ModuleManagement },
        ],
    },
    {
        label: "Centres",
        dropdown: true,
        items: [
            { label: "Create Centre", href: "/centres/create", allowedRoles: permissions.Centres },
            { label: "List Centres", href: "/centres/list", allowedRoles: permissions.Centres },
        ],
    },
    {
        label: "Batch",
        dropdown: true,
        items: [
            { label: "Create Batch", href: "/batches/create", allowedRoles: permissions.Batch },
            { label: "List Batch", href: "/batches/list", allowedRoles: permissions.Batch },
        ],
    },
    {
        label: "Master",
        dropdown: true,
        items: [
            { label: "State", href: "/master/states", allowedRoles: permissions.Master },
            { label: "District", href: "/master/districts", allowedRoles: permissions.Master },
        ],
    },
    {
        label: "User Management",
        dropdown: true,
        items: [
            { label: "Create User", href: "/users/create", allowedRoles: permissions.CreateUser },
            { label: "List Users", href: "/users/userlist", allowedRoles: permissions.CreateUser },
            { label: "Create Participant", href: "/participants/create", allowedRoles: permissions.CreateParticipant },
            { label: "List Participants", href: "/participants/list", allowedRoles: permissions.CreateParticipant },
        ],
    },
    {
        label: "Document Management",
        dropdown: true,
        items: [
            { label: "Document Master", href: "/documents", allowedRoles: permissions.DocumentManagement },
        ],
    },
    {
        label: "Assessment",
        dropdown: true,
        items: [
            { label: "All Assessments", href: "/assessments", allowedRoles: permissions.Assessment },
            { label: "Add Assessment", href: "/assessments/add", allowedRoles: permissions.Assessment },
        ],
    },
];


/* ===================================================== */
/* NAVBAR UI SETTINGS */
/* ===================================================== */

// Change this ONE value to change all main navbar menu text
const NAVBAR_TEXT_SIZE = "!text-[15px]";

// Dropdown submenu text
const DROPDOWN_TEXT_SIZE = "!text-[15px]";

// Mobile main menu text
const MOBILE_NAVBAR_TEXT_SIZE = "!text-[14px]";

// Mobile submenu text
const MOBILE_DROPDOWN_TEXT_SIZE = "!text-[13px]";

// Height of the white top header
const HEADER_HEIGHT = "h-[60px]";

// Height of the purple menu bar (dropdowns open exactly below this)
const NAVBAR_ROW_HEIGHT = "h-[44px]";

// Horizontal padding of a single top level menu item
const NAVBAR_ITEM_PADDING = "px-[6px] xl:px-[8px]";

// Outer horizontal padding shared by the header and the menu bar
const OUTER_PADDING = "px-[15px]";


export default function Navbar() {

    const [isMenuOpen, setMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [isProfileOpen, setProfileOpen] = useState(false);

    const profileRef = useRef(null);

    const { pathname } = useLocation();
    const role = localStorage.getItem("userRole");
    const visibleMenuItems = menuItems
        .map((item) => (
            item.dropdown
                ? { ...item, items: item.items.filter((subItem) => hasPermission(subItem.allowedRoles, role)) }
                : item
        ))
        .filter((item) => (
            item.dropdown
                ? item.items.length > 0
                : hasPermission(item.allowedRoles, role)
        ));


    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/Login");
    };


    useEffect(() => {

        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);


    const closeMobileMenu = () => {
        setMenuOpen(false);
    };


    return (

        <nav className="fixed top-0 left-0 right-0 z-[1020] w-full border-t-[2px] border-[#732269] bg-white">

            <div className="w-full">


                {/* ===================================================== */}
                {/* TOP HEADER                                            */}
                {/* 3 zones: LEFT (toggle + logo) | CENTER (title) | RIGHT */}
                {/* ===================================================== */}

                <div className={`relative w-full ${HEADER_HEIGHT} flex flex-row flex-nowrap items-center justify-between ${OUTER_PADDING} bg-white`}>


                    {/* ============ LEFT ZONE : TOGGLE + LOGO ============ */}

                    <div className="flex flex-row items-center shrink-0">


                        {/* MOBILE TOGGLE */}

                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="lg:hidden flex items-center justify-center mr-[12px] text-[#344054] bg-transparent border-0 p-0 leading-none"
                            aria-label="Toggle Navigation"
                        >
                            {isMenuOpen ? (
                                <FaTimes size={20} />
                            ) : (
                                <FaBars size={20} />
                            )}
                        </button>


                        {/* LOGO */}

                        <Link
                            to="/dashboard"
                            className="flex items-center shrink-0 !no-underline"
                        >

                            <img
                                src={logo}
                                alt="Azad Foundation"
                                className="block w-[160px] h-auto object-contain"
                            />

                        </Link>

                    </div>


                    {/* ============ CENTER ZONE : LMS DASHBOARD TITLE ============ */}

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none z-[1]">

                        <span className="m-0 text-[24px] leading-[1.2] font-bold text-[#344050] whitespace-nowrap">
                            LMS Dashboard
                        </span>

                    </div>


                    {/* ============ RIGHT ZONE : USER + AVATAR ============ */}

                    <ul className="relative z-[2] flex flex-row flex-nowrap items-center gap-[10px] shrink-0 !ml-auto !mr-0 !my-0 !pl-0 !pr-0 !py-0 !list-none">


                        {/* USER NAME + ROLE */}

                        <li className="hidden sm:block leading-none">

                            <div className="flex flex-col items-end justify-center text-right">

                                <strong className="block text-[14px] leading-[17px] font-semibold text-[#5e6e82] whitespace-nowrap">
                                    Super Admin
                                </strong>

                                <span className="block text-[10px] leading-[14px] font-normal text-[#5e6e82] whitespace-nowrap">
                                    Super Admin
                                </span>

                            </div>

                        </li>


                        {/* AVATAR + PROFILE DROPDOWN */}

                        <li
                            ref={profileRef}
                            className="relative flex items-center"
                        >

                            <button
                                type="button"
                                onClick={() => setProfileOpen((prev) => !prev)}
                                className="flex items-center justify-center bg-transparent border-0 p-0 leading-none cursor-pointer focus:outline-none"
                                aria-label="User menu"
                            >

                                <img
                                    src={avatar}
                                    alt="User Avatar"
                                    className="block w-[33px] h-[33px] rounded-full object-cover"
                                />

                            </button>


                            {/* PROFILE DROPDOWN */}

                            {isProfileOpen && (

                                <div className="absolute right-[-8px] top-[calc(100%+10px)] z-[1050] w-[180px] bg-white border border-[#d8dee8] rounded-[8px] shadow-[0_0.5rem_1rem_rgba(0,0,0,0.15)] overflow-visible">


                                    {/* ARROW */}

                                    <div className="absolute right-[20px] top-[-6px] w-[12px] h-[12px] bg-white border-l border-t border-[#d8dee8] rotate-45" />


                                    <div className="relative bg-white rounded-[8px] overflow-hidden">


                                        {/* PROFILE */}

                                        <Link
                                            to="#profile"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-[10px] min-h-[45px] px-[16px] text-[15px] font-bold !text-[#732269] !no-underline hover:!no-underline hover:!text-[#732269] hover:bg-[#f9f5f8]"
                                        >

                                            <FaCrown size={16} className="shrink-0" />

                                            <span>
                                                Profile
                                            </span>

                                        </Link>


                                        <div className="border-t border-[#d8dee8]" />


                                        {/* CHANGE PASSWORD */}

                                        <Link
                                            to="#change-password"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center min-h-[45px] px-[16px] text-[14px] font-medium !text-[#4d5969] !no-underline hover:!no-underline hover:!text-[#4d5969] hover:bg-gray-50"
                                        >
                                            Change Password
                                        </Link>


                                        <div className="border-t border-[#d8dee8]" />


                                        {/* LOGOUT */}

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-[10px] min-h-[45px] px-[16px] text-left text-[14px] font-medium text-[#de4a4a] bg-white border-0 hover:bg-red-50 cursor-pointer"
                                        >

                                            <FaSignOutAlt size={15} className="shrink-0" />

                                            <span>
                                                Logout
                                            </span>

                                        </button>

                                    </div>

                                </div>

                            )}

                        </li>

                    </ul>

                </div>


                {/* ===================================================== */}
                {/* DESKTOP NAVIGATION BAR */}
                {/* ===================================================== */}

                <div className="hidden lg:block w-full bg-[#732269]">

                    <div className={`w-full ${OUTER_PADDING}`}>

                        <ul className={`flex flex-row flex-nowrap items-stretch ${NAVBAR_ROW_HEIGHT} !m-0 !pl-0 !pr-0 !py-0 !list-none`}>

                            {visibleMenuItems.map((item) => {


                                /* ================= NORMAL MENU ================= */

                                if (!item.dropdown) {

                                    return (

                                        <li
                                            key={item.label}
                                            className="relative flex items-stretch shrink-0"
                                        >

                                            <Link
                                                to={item.href}
                                                className={`flex items-center h-full ${NAVBAR_ITEM_PADDING} ${NAVBAR_TEXT_SIZE} leading-5 font-medium !text-white whitespace-nowrap !no-underline hover:!no-underline focus:!no-underline hover:!text-[#00d4c7] transition-colors duration-150`}
                                            >
                                                {item.label}
                                            </Link>

                                        </li>

                                    );

                                }


                                /* ================= DROPDOWN MENU ================= */

                                const isOpen = openMenu === item.label;


                                return (

                                    <li
                                        key={item.label}
                                        className="relative flex items-stretch shrink-0"
                                        onMouseEnter={() => setOpenMenu(item.label)}
                                        onMouseLeave={() => setOpenMenu(null)}
                                    >


                                        {/* PARENT MENU */}

                                        <button
                                            type="button"
                                            className={`flex items-center h-full gap-[6px] ${NAVBAR_ITEM_PADDING} ${NAVBAR_TEXT_SIZE} leading-5 font-medium whitespace-nowrap bg-transparent border-0 cursor-pointer transition-colors duration-150 ${isOpen ? "!text-[#00d4c7]" : "!text-white hover:!text-[#00d4c7]"}`}
                                        >

                                            <span>
                                                {item.label}
                                            </span>

                                            <FaCaretDown
                                                size={9}
                                                className={`shrink-0 mt-[1px] transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                                            />

                                        </button>


                                        {/* ================= DROPDOWN ================= */}

                                        {isOpen && (

                                            <div className="absolute left-0 top-full z-[1050] min-w-[200px] bg-white rounded-[8px] shadow-[0_8px_16px_rgba(0,0,0,0.15)] py-[8px]">


                                                {/* DROPDOWN ARROW */}

                                                <div className="absolute left-[24px] top-[-6px] w-[12px] h-[12px] bg-white rotate-45 rounded-[1px]" />


                                                {/* DROPDOWN ITEMS */}

                                                <div className="relative z-[1] bg-white overflow-hidden rounded-[8px]">

                                                    {item.items.map((subItem) => {

                                                        const isActive =
                                                            pathname === subItem.href ||
                                                            pathname.startsWith(`${subItem.href}/`);

                                                        return (

                                                            <Link
                                                                key={subItem.href}
                                                                to={subItem.href}
                                                                onClick={() => setOpenMenu(null)}
                                                                className={`block w-full px-[16px] py-[7px] ${DROPDOWN_TEXT_SIZE} leading-[20px] font-medium whitespace-nowrap !no-underline hover:!no-underline focus:!no-underline transition-colors ${isActive ? "!text-[#4d5969] bg-[#edf2f9]" : "!text-[#4d5969] hover:!text-[#4d5969] hover:bg-[#edf2f9]"}`}
                                                            >
                                                                {subItem.label}
                                                            </Link>

                                                        );

                                                    })}

                                                </div>

                                            </div>

                                        )}

                                    </li>

                                );

                            })}

                        </ul>

                    </div>

                </div>


                {/* ===================================================== */}
                {/* MOBILE NAVIGATION */}
                {/* ===================================================== */}

                {isMenuOpen && (

                    <div className="lg:hidden w-full bg-[#732269] max-h-[calc(100vh-62px)] overflow-y-auto">

                        <ul className="w-full !m-0 !pl-0 !pr-0 !py-0 !list-none">

                            {visibleMenuItems.map((item) => {


                                /* ================= MOBILE NORMAL MENU ================= */

                                if (!item.dropdown) {

                                    const isActive = pathname === item.href;

                                    return (

                                        <li
                                            key={item.label}
                                            className="border-b border-white/10"
                                        >

                                            <Link
                                                to={item.href}
                                                onClick={closeMobileMenu}
                                                className={`block w-full px-[16px] py-[11px] ${MOBILE_NAVBAR_TEXT_SIZE} leading-[20px] font-medium !no-underline hover:!no-underline transition-colors ${isActive ? "!text-[#00d4c7] bg-white/10" : "!text-white hover:!text-[#00d4c7]"}`}
                                            >
                                                {item.label}
                                            </Link>

                                        </li>

                                    );

                                }


                                /* ================= MOBILE DROPDOWN ================= */

                                return (

                                    <MobileMenuItem
                                        key={item.label}
                                        item={item}
                                        pathname={pathname}
                                        closeMobileMenu={closeMobileMenu}
                                    />

                                );

                            })}

                        </ul>

                    </div>

                )}

            </div>

        </nav>

    );
}


function MobileMenuItem({
    item,
    pathname,
    closeMobileMenu,
}) {

    const [isOpen, setIsOpen] = useState(false);


    const isMenuActive = item.items.some(
        (subItem) =>
            pathname === subItem.href ||
            pathname.startsWith(`${subItem.href}/`)
    );


    return (

        <li className="border-b border-white/10">


            {/* PARENT */}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-[16px] py-[11px] ${MOBILE_NAVBAR_TEXT_SIZE} leading-[20px] font-medium bg-transparent border-0 text-left transition-colors ${isOpen || isMenuActive ? "!text-[#00d4c7]" : "!text-white"}`}
            >

                <span>
                    {item.label}
                </span>

                <FaCaretDown
                    size={9}
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />

            </button>


            {/* SUB MENU */}

            {isOpen && (

                <div className="bg-[#67205e]">

                    {item.items.map((subItem) => {

                        const isActive =
                            pathname === subItem.href ||
                            pathname.startsWith(`${subItem.href}/`);

                        return (

                            <Link
                                key={subItem.href}
                                to={subItem.href}
                                onClick={closeMobileMenu}
                                className={`block px-[30px] py-[8px] ${MOBILE_DROPDOWN_TEXT_SIZE} leading-[20px] font-medium !no-underline hover:!no-underline ${isActive ? "!text-white bg-white/10" : "!text-white/90 hover:!text-white hover:bg-white/10"}`}
                            >
                                {subItem.label}
                            </Link>

                        );

                    })}

                </div>

            )}

        </li>

    );
}
