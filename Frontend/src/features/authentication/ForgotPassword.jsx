import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [captcha, setCaptcha] = useState("");

    return (
        // <div className="min-h-screen">
        //     <div className="container flex flex-col p-5 bg-amber-50 w-2xl">
        //         <div className="row">
        //             <div className="">
        //                 <h2 className="card-header-2 text-base  text-center" >
        //                     Forgot Password?
        //                 </h2>
        //             </div>
        //         </div>
        //     </div>
        // </div>

        <div className="min-h-screen flex flex-col bg-white w-full">
            {/* Main */}

            <main className="flex-1 flex  justify-center mt-5 ">

                <div className="w-full max-w-124.5 ">

                    <div className="bg-white  shadow-lg border border-gray-200 overflow-hidden">

                        {/* Header */}

                        <div className="bg-[#732269] justify-center items-center flex h-[40px]">

                            <p className="text-center text-white text-[18px] justify-around  leading-none m-0">
                                Forgot Password?
                            </p>

                        </div>

                        {/* Body */}

                        <div className="px-3 pt-3 pb-4">
                            {/* Email Address */}

                            <div className="mb-4">

                                <label htmlFor="email" className="block mb-2 text-[17px] font-normal text-[#212529]">
                                    Email Address
                                </label>
                                <input id="email" type="email" placeholder="Enter your email" className=" w-full h-[40px] rounded border border-[#ced4da] px-3 text-[16px] outline-none focus:border-[#86b7fe] focus:ring-[3px] focus:ring-[#0d6efd40] " />
                            </div>

                            <div className="flex ">
                                <label className="block text-[17px] text-[#212529]">
                                    Captcha
                                </label>
                                <div className="mt-2">

                                    <ReCAPTCHA
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                        onChange={(token) => setCaptchaToken(token)}
                                    />

                                </div>
                            </div>
                            <button className="bg-[#732269] text-white w-full h-[40px] rounded border border-[#732269] px-3  font-medium transition-colors text-[16px] outline-none focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd40] mt-2">
                                Send Password Reset Link
                            </button>
                        </div>

                    </div>

                </div>

            </main>
            {/* Footer */}
            <footer className="mt-auto bg-[#732269] h-[52px] flex items-center justify-center">
                <p className="text-white text-[15px] font-medium leading-none m-0">
                    © 2025 Azad Foundation. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}