import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logos/logo.svg";

const sections = [
    {
        id: "general",
        title: "General Disclaimer",
        icon: "document",
        intro: "Please be aware of the following terms governing the use of educational content on this platform:",
        items: [
            "All educational content provided on the LMS is intended for training and knowledge-building purposes only",
            "Content must not be copied, reproduced, distributed, or used for commercial purposes without prior written approval from Azad Foundation",
            "While efforts are made to ensure accuracy and relevance of materials, Azad Foundation does not guarantee that all content is error-free or applicable to every learner's personal context",
            "Completion of courses or certifications through the LMS does not constitute formal employment or a legally binding qualification unless explicitly stated by Azad Foundation",
        ],
    },
    {
        id: "liability",
        title: "Limitation of Liability",
        icon: "warning",
        intro: "Azad Foundation shall not be liable for:",
        items: [
            "Technical issues, access interruptions, or data loss due to unforeseen circumstances",
            "User misuse of the platform or non-compliance with platform guidelines",
            "Any indirect or incidental damages resulting from LMS use or content interpretation",
        ],
    },
    {
        id: "access",
        title: "Platform Access",
        icon: "lock",
        intro: "Azad Foundation reserves the right to:",
        items: [
            "Modify or discontinue any content or service on the LMS without prior notice",
            "Restrict, suspend, or terminate access for any user violating platform policies or guidelines",
        ],
    },
];

const tocItems = [
    ["general", "General Disclaimer"],
    ["liability", "Limitation of Liability"],
    ["access", "Platform Access"],
    ["updates", "Policy Updates"],
    ["contact", "Contact Information"],
];

function Icon({ type, className = "" }) {
    const common = {
        className: `h-5 w-5 ${className}`,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    if (type === "list") {
        return (
            <svg viewBox="0 0 24 24" {...common}>
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
        );
    }

    if (type === "document") {
        return (
            <svg viewBox="0 0 24 24" {...common}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        );
    }

    if (type === "warning") {
        return (
            <svg viewBox="0 0 24 24" {...common}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        );
    }

    if (type === "lock") {
        return (
            <svg viewBox="0 0 24 24" {...common}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        );
    }

    if (type === "refresh") {
        return (
            <svg viewBox="0 0 24 24" {...common}>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
        );
    }

    if (type === "mail") {
        return (
            <svg viewBox="0 0 24 24" {...common}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        );
    }

    return null;
}

function PolicySection({ section }) {
    return (
        <section id={section.id} className="group mb-6 scroll-mt-24 rounded-2xl border border-[#ebe7e3] bg-white px-5 py-6 shadow-[0_1px_3px_rgba(114,34,104,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(114,34,104,0.08)] sm:px-7 sm:py-8 md:px-11 md:py-10">
            <div className="mb-5 flex items-start gap-3 md:gap-4">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[rgba(114,34,104,0.08)] to-[rgba(114,34,104,0.03)] text-[#722268] transition-all duration-300 group-hover:from-[rgba(114,34,104,0.14)] group-hover:to-[rgba(114,34,104,0.06)] md:h-11 md:w-11">
                    <Icon type={section.icon} className="md:h-[22px] md:w-[22px]" />
                </div>

                <h2 className="pt-1 text-[1.2rem] leading-tight tracking-[-0.01em] text-[#2d2a32] md:text-[1.45rem]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    {section.title}
                </h2>
            </div>

            <p className="mb-4 text-[0.93rem] leading-[1.8] text-[#6b6473] md:text-[0.95rem]">
                {section.intro}
            </p>

            <ul className="my-4">
                {section.items.map((item, index) => (
                    <li key={index} className="relative border-b border-black/[0.04] py-2.5 pl-7 text-[0.91rem] leading-[1.7] text-[#6b6473] last:border-b-0">
                        <span className="absolute left-0.5 top-[18px] h-2 w-2 rounded-full bg-gradient-to-br from-[#722268] to-[#9a3d8f] opacity-50" />
                        {item}
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function disclaimer_Azad_LMS() {
    return (
        <div className="policy-page min-h-screen overflow-x-hidden bg-[#faf8f6] text-[#2d2a32]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-[#501848] via-[#722268] to-[#9a3d8f] shadow-[0_4px_20px_rgba(114,34,104,0.25)]">
                <div className="flex w-full items-center justify-between px-5 py-3.5 md:px-8 md:py-4">
                    <Link to="/login" className="flex items-center gap-3.5" aria-label="Go to login">
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
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-white/90 backdrop-blur-md">
                            <svg className="h-4 w-4 fill-[#e8a44a]" viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Terms of Use
                        </div>

                        <h1 className="mb-5 text-[1.9rem] leading-[1.15] tracking-[-0.02em] text-white sm:text-[2.4rem] md:text-[3.8rem]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                            Disclaimer
                        </h1>

                        <p className="mx-auto max-w-[620px] text-[0.98rem] font-light leading-[1.75] text-white/75 md:text-[1.1rem]">
                            The Azad Foundation LMS is an internal educational platform exclusively designed for registered trainees, trainers, and authorized staff members.
                        </p>
                    </div>
                </section>

                {/* Wave */}
                <div className="-mt-px block">
                    <svg className="block h-auto w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
                        <path fill="#faf8f6" d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 -mt-10 w-full px-5 pb-16 md:px-8 md:pb-20">
                    {/* Table of Contents */}
                    <div className="mb-12 rounded-2xl border border-[#ebe7e3] bg-white px-5 py-6 shadow-[0_20px_60px_rgba(114,34,104,0.10)] sm:px-7 sm:py-7 md:px-10 md:py-9">
                        <div className="mb-4 flex items-center gap-2.5 text-[1.15rem] text-[#722268]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                            <Icon type="list" className="text-[#e8a44a]" />
                            What's Covered
                        </div>

                        <ul className="grid grid-cols-1 gap-x-7 gap-y-1.5 md:grid-cols-2">
                            {tocItems.map(([id, label]) => (
                                <li key={id}>
                                    <a href={`#${id}`} className="group/link flex items-center gap-2 py-1.5 text-[0.88rem] text-[#6b6473] transition-all duration-200 hover:text-[#722268]">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8a44a]/60 transition-all duration-200 group-hover/link:scale-125 group-hover/link:bg-[#e8a44a]" />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Main Policy Sections */}
                    {sections.map((section) => (
                        <PolicySection key={section.id} section={section} />
                    ))}

                    {/* Policy Updates */}
                    <section id="updates" className="group mb-6 scroll-mt-24 rounded-2xl border border-[#ebe7e3] bg-white px-5 py-6 shadow-[0_1px_3px_rgba(114,34,104,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(114,34,104,0.08)] sm:px-7 sm:py-8 md:px-11 md:py-10">
                        <div className="mb-5 flex items-start gap-3 md:gap-4">
                            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[rgba(114,34,104,0.08)] to-[rgba(114,34,104,0.03)] text-[#722268] transition-all duration-300 group-hover:from-[rgba(114,34,104,0.14)] group-hover:to-[rgba(114,34,104,0.06)] md:h-11 md:w-11">
                                <Icon type="refresh" className="md:h-[22px] md:w-[22px]" />
                            </div>

                            <h2 className="pt-1 text-[1.2rem] leading-tight text-[#2d2a32] md:text-[1.45rem]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                                Policy Updates
                            </h2>
                        </div>

                        <p className="text-[0.93rem] leading-[1.8] text-[#6b6473] md:text-[0.95rem]">
                            This policy may be updated periodically to reflect operational, legal, or technical changes. Updated versions will be posted directly on the LMS platform.
                        </p>

                        <div className="mt-3 rounded-r-[10px] border-l-[3px] border-[#e8a44a] bg-gradient-to-r from-[rgba(114,34,104,0.04)] to-[rgba(232,164,74,0.04)] px-5 py-3.5 text-[0.9rem] font-medium leading-[1.7] text-[#2d2a32]">
                            Continued use of the LMS signifies acceptance of the revised policy.
                        </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="group mb-6 scroll-mt-24 rounded-2xl border border-[#ebe7e3] bg-white px-5 py-6 shadow-[0_1px_3px_rgba(114,34,104,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(114,34,104,0.08)] sm:px-7 sm:py-8 md:px-11 md:py-10">
                        <div className="mb-5 flex items-start gap-3 md:gap-4">
                            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[rgba(114,34,104,0.08)] to-[rgba(114,34,104,0.03)] text-[#722268] md:h-11 md:w-11">
                                <Icon type="mail" className="md:h-[22px] md:w-[22px]" />
                            </div>

                            <h2 className="pt-1 text-[1.2rem] leading-tight text-[#2d2a32] md:text-[1.45rem]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                                Contact Information
                            </h2>
                        </div>

                        <p className="text-[0.93rem] leading-[1.8] text-[#6b6473]">
                            For questions related to this Privacy Policy or Disclaimer, please reach out to us:
                        </p>
                    </section>

                    {/* CTA */}
                    <div className="mt-2 rounded-2xl border border-[#722268]/[0.12] bg-gradient-to-br from-[rgba(114,34,104,0.06)] to-[rgba(232,164,74,0.06)] px-5 py-7 text-center sm:px-7 md:px-10 md:py-8">
                        <p className="mb-4 text-[0.93rem] text-[#6b6473]">
                            Have questions? We're here to help.
                        </p>

                        <a href="mailto:support@azadfoundation.com" className="inline-flex items-center gap-2.5 rounded-full bg-[#722268] px-6 py-3 text-[0.93rem] font-semibold tracking-[0.01em] text-white shadow-[0_4px_16px_rgba(114,34,104,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#501848] hover:shadow-[0_6px_24px_rgba(114,34,104,0.35)] sm:px-7">
                            <Icon type="mail" className="h-[18px] w-[18px]" />
                            support@azadfoundation.com
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-br from-[#501848] to-[#722268] px-6 py-10 text-center md:px-8 md:py-12">
                <div className="mx-auto max-w-[600px]">
                    <div className="mb-2.5 text-[1.2rem] text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        Azad Foundation
                    </div>

                    <div className="mx-auto my-[18px] h-0.5 w-[50px] rounded bg-[#e8a44a]/60" />

                    <p className="text-[0.83rem] leading-[1.7] text-white/60">
                        This platform is designed exclusively for authorized Azad Foundation staff, trainers, and registered trainees participating in foundation programs.
                    </p>
                </div>
            </footer>
        </div>
    );
}
