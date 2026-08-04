import React from "react";

export default function Footer() {
    return (
        <footer className="w-full bg-[#344050] mt-auto">

            <div className="w-full px-[16px]">

                <div className="h-[62px] flex flex-col sm:flex-row items-center justify-between">

                    {/* LEFT */}
                    <p className="m-0 text-[14px] leading-[21px] font-normal !text-white">
                        © 2025 Azad Foundation. All Rights Reserved.
                    </p>

                    {/* RIGHT */}
                    <p className="m-0 text-[14px] leading-[21px] font-normal !text-white">
                        Powered by:{" "}

                        <a
                            href="https://www.indevconsultancy.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-normal !text-[#00d4c7] !no-underline hover:!text-[#00d4c7]"
                        >
                            Indev Consultancy Pvt. Ltd.
                        </a>
                    </p>

                </div>

            </div>

        </footer>
    );
}