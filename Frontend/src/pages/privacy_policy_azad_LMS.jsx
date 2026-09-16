import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logos/logo.svg";

const sections = [
    {
        id: "info-collect",
        title: "Information We Collect",
        icon: "document",
        intro: "We collect the following information solely for training, learning management, and program monitoring purposes:",
        items: [
            "Personal information including name, contact details, age group, and location",
            "Login credentials (username and password)",
            "Training records such as course enrollment, progress tracking, assessments, attendance, and certification details",
            "Usage data including device type, login activity, and content engagement for internal analytics",
        ],
        note: "No financial or commercially sensitive personal information is collected through the LMS.",
    },
    {
        id: "purpose",
        title: "Purpose of Data Collection",
        icon: "info",
        intro: "Information is collected and used for:",
        items: [
            "User authentication and access management",
            "Delivering learning content and tracking progress",
            "Program monitoring and evaluation",
            "Issuing training certificates",
            "Internal reporting to measure training outcomes and improve content delivery",
            "System security and troubleshooting",
        ],
        note: "Personal data is strictly used for educational and administrative purposes related to Azad Foundation programs.",
    },
    {
        id: "sharing",
        title: "Data Sharing",
        icon: "share",
        intro: "User information is:",
        items: [
            "Not sold, traded, or shared with any external third parties for marketing or commercial purposes",
            "Shared only on a need-to-know basis with authorized Azad Foundation staff or contracted service providers involved in LMS hosting, maintenance, or analytics strictly for operational support",
        ],
        note: "All vendors and partners are contractually obligated to maintain confidentiality and data protection standards.",
    },
    {
        id: "security",
        title: "Data Security",
        icon: "shield",
        intro: "Appropriate technical and organizational safeguards are implemented to protect user information, including:",
        items: [
            "Secure authentication and role-based access",
            "Encrypted data storage and secure hosting infrastructure",
            "Periodic security audits and system monitoring",
            "Regular backups to prevent data loss",
        ],
        note: "Only authorized personnel have access to LMS data.",
    },
    {
        id: "responsibilities",
        title: "User Responsibilities",
        icon: "users",
        intro: "All users are responsible for:",
        items: [
            "Maintaining confidentiality of login credentials",
            "Ensuring information provided is accurate and up to date",
            "Using the LMS solely for lawful educational purposes",
            "Respecting the privacy and dignity of other learners and staff",
        ],
        note: "Users must not share accounts or misuse platform content.",
    },
    {
        id: "retention",
        title: "Data Retention",
        icon: "clock",
        intro: "Personal data is retained only for as long as necessary to fulfill program objectives and reporting requirements or as mandated by law. Upon course completion or exit from the program, data may be archived or anonymized for internal records and impact reporting.",
    },
    {
        id: "rights",
        title: "User Rights",
        icon: "check",
        intro: "Users may:",
        items: [
            "Request access to their personal data",
            "Request correction of inaccurate records",
            "Raise concerns regarding privacy or data use",
        ],
        note: "All requests should be addressed to Azad Foundation through the official program contact channels.",
    },
];

const toc = [
    ["info-collect", "Information We Collect"],
    ["purpose", "Purpose of Data Collection"],
    ["sharing", "Data Sharing"],
    ["security", "Data Security"],
    ["responsibilities", "User Responsibilities"],
    ["retention", "Data Retention"],
    ["rights", "User Rights"],
];

function Icon({ type, className = "" }) {
    const props = {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: `h-5 w-5 ${className}`,
    };

    switch (type) {
        case "list":
            return (
                <svg {...props}>
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
            );

        case "document":
            return (
                <svg {...props}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            );

        case "info":
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
            );

        case "share":
            return (
                <svg {...props}>
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
            );

        case "shield":
            return (
                <svg {...props}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            );

        case "users":
            return (
                <svg {...props}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );

        case "clock":
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            );

        case "check":
            return (
                <svg {...props}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            );

        default:
            return null;
    }
}

function PolicySection({ section, index }) {
    return (
        <section id={section.id} className="group mb-6 scroll-mt-24 rounded-2xl border border-[#ebe7e3] bg-white px-5 py-6 shadow-[0_1px_3px_rgba(114,34,104,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(114,34,104,0.08)] animate-[fadeUp_0.7s_ease-out_both] sm:px-7 sm:py-8 md:px-11 md:py-10" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="mb-5 flex items-start gap-3 md:gap-4">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[rgba(114,34,104,0.08)] to-[rgba(114,34,104,0.03)] text-[#722268] transition-all duration-300 group-hover:from-[rgba(114,34,104,0.14)] group-hover:to-[rgba(114,34,104,0.06)] md:h-11 md:w-11">
                    <Icon type={section.icon} className="h-5 w-5 md:h-[22px] md:w-[22px]" />
                </div>

                <h2 className="pt-1 text-[1.2rem] leading-[1.3] tracking-[-0.01em] text-[#2d2a32] md:text-[1.45rem]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    {section.title}
                </h2>
            </div>

            <p className="mb-4 text-[0.93rem] leading-[1.8] text-[#6b6473] md:text-[0.95rem]">
                {section.intro}
            </p>

            {section.items && (
                <ul className="my-4">
                    {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="relative border-b border-black/[0.04] py-2.5 pl-7 text-[0.91rem] leading-[1.7] text-[#6b6473] last:border-b-0">
                            <span className="absolute left-0.5 top-[18px] h-2 w-2 rounded-full bg-gradient-to-br from-[#722268] to-[#9a3d8f] opacity-50" />
                            {item}
                        </li>
                    ))}
                </ul>
            )}

            {section.note && (
                <div className="mt-3 rounded-r-[10px] border-l-[3px] border-[#e8a44a] bg-gradient-to-r from-[rgba(114,34,104,0.04)] to-[rgba(232,164,74,0.04)] px-5 py-3.5 text-[0.9rem] font-medium leading-[1.7] text-[#2d2a32]">
                    {section.note}
                </div>
            )}
        </section>
    );
}

const Privacy_Policy_Azad_LMS = () => {
    return (
        <div className="policy-page min-h-screen overflow-x-hidden bg-[#faf8f6] text-[#2d2a32]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <header className="sticky top-0 z-[100] bg-gradient-to-br from-[#501848] via-[#722268] to-[#9a3d8f] shadow-[0_4px_20px_rgba(114,34,104,0.25)]">
                <div className="flex w-full items-center justify-between px-5 py-3.5 md:px-8 md:py-4">
                    <Link to="/login" className="flex items-center gap-3.5 no-underline" aria-label="Go to login">
                        <img src={logo} alt="Azad Foundation Logo" className="h-10 w-auto brightness-0 invert md:h-11" />
                    </Link>

                    <Link to="/login" className="rounded-full border-[1.5px] border-white/25 px-5 py-2 text-[0.82rem] font-medium uppercase tracking-[0.03em] text-white !no-underline transition-all duration-300 hover:border-white/50 hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                        Back to login
                    </Link>
                </div>
            </header>

            <main className="policy-page__content">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#501848] via-[#722268] to-[#9a3d8f] px-5 pb-[72px] pt-14 md:px-8 md:pb-[100px] md:pt-20">
                    <div className="pointer-events-none absolute -right-[20%] -top-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(232,164,74,0.15)_0%,transparent_70%)]" />

                    <div className="pointer-events-none absolute -bottom-[30%] -left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

                    <div className="relative z-10 mx-auto max-w-[800px] text-center">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-white/90 backdrop-blur-[10px]">
                            <svg className="h-4 w-4 fill-[#e8a44a]" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                            </svg>
                            Your Data, Our Responsibility
                        </div>

                        <h1 className="mb-5 text-[1.9rem] leading-[1.15] tracking-[-0.02em] text-white sm:text-[2.4rem] md:text-[3.8rem]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                            Privacy Policy
                        </h1>

                        <p className="mx-auto max-w-[600px] text-[0.98rem] font-light leading-[1.75] text-white/75 md:text-[1.1rem]">
                            Azad Foundation respects the privacy of all users of its Learning Management System. This policy outlines how your information is collected, used, and protected.
                        </p>
                    </div>
                </section>

                {/* Wave Divider */}
                <div className="-mt-0.5 block">
                    <svg className="block h-auto w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
                        <path fill="#faf8f6" d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-[5] -mt-10 w-full px-5 pb-16 md:px-8 md:pb-20">
                    {/* Table of Contents */}
                    <div className="mb-12 rounded-2xl border border-[#ebe7e3] bg-white px-5 py-6 shadow-[0_20px_60px_rgba(114,34,104,0.10)] sm:px-7 sm:py-7 md:px-10 md:py-9">
                        <div className="mb-[18px] flex items-center gap-2.5 text-[1.15rem] text-[#722268]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                            <Icon type="list" className="h-5 w-5 text-[#e8a44a]" />
                            What's Covered
                        </div>

                        <ul className="grid grid-cols-1 gap-x-7 gap-y-1.5 md:grid-cols-2">
                            {toc.map(([id, label]) => (
                                <li key={id}>
                                    <a href={`#${id}`} className="group/link flex items-center gap-2 py-1.5 text-[0.88rem] text-[#6b6473] no-underline transition-colors duration-200 hover:text-[#722268]">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8a44a] opacity-60 transition-all duration-200 group-hover/link:scale-125 group-hover/link:opacity-100" />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policy Sections */}
                    {sections.map((section, index) => (
                        <PolicySection key={section.id} section={section} index={index + 1} />
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-br from-[#501848] to-[#722268] px-6 py-10 text-center md:px-8 md:py-12">
                <div className="mx-auto max-w-[600px]">
                    <div className="mb-2.5 text-[1.2rem] text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        Azad Foundation
                    </div>

                    <div className="mx-auto my-[18px] h-0.5 w-[50px] rounded bg-[#e8a44a] opacity-60" />

                    <p className="text-[0.83rem] leading-[1.7] text-white/60">
                        This platform is designed exclusively for authorized Azad Foundation staff, trainers, and registered trainees participating in foundation programs.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Privacy_Policy_Azad_LMS;
