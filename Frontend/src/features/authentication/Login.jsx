import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/logos/logo.svg";
import slide1 from "../../assets/images/slide-banner-1.png";
import slide2 from "../../assets/images/slide-banner-2.png";
import slide3 from "../../assets/images/slide-banner-3.png";
import forgotpassword from "./ForgotPassword";
import NotFound from "./NotFound";
import { getCaptcha, loginUser } from "../../api/AuthApi";
import "swiper/css";

export default function Login() {
    const images = [slide1, slide2, slide3];

    const navigate = useNavigate();


    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [captchaQuestion, setCaptchaQuestion] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");


    const loadCaptcha = async () => {
        try {
            console.log("Loading Captcha...");

            const response = await getCaptcha();

            console.log("Captcha Response:", response);

            setCaptchaQuestion(response.question);
            setCaptchaToken(response.captcha_token);

            console.log("Token Saved:", response.captcha_token);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        console.log("Component Mounted");
        loadCaptcha();
    }, []);
    const {
        register,
        handleSubmit,
        setValue,
        setFocus,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        console.log(data);
        let payload;
        try {
            payload = {
                email: data.username.trim().toLowerCase(),
                password: data.password,
                captcha_answer: Number(data.captcha),
                captcha_token: captchaToken,
            };
            console.log("Payload:", payload);

            const response = await loginUser(payload);

            console.log("Response:", response);
            console.log("Login Success:", response);
            // Save JWT
            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("refresh_token", response.refresh_token);
            localStorage.setItem("user", JSON.stringify(response.user));
            localStorage.setItem("userRole", response.user.role);
            // Redirect
            navigate("/dashboard");


        } catch (error) {
            console.log("Status:", error.response?.status);
            console.log("Response:", error.response?.data);

            const detail = error.response?.data?.detail;
            let errMsg = "Login Failed";

            if (typeof detail === "string") {
                errMsg = detail;
            } else if (Array.isArray(detail) && detail.length > 0) {
                errMsg = detail[0]?.msg || "Login Failed";
            } else if (detail && typeof detail === "object") {
                errMsg = JSON.stringify(detail);
            }

            setMessage(errMsg);
            await loadCaptcha();
        }
    };

    return (

        <div className="container-fluid mr-auto ml-auto p-0 m-0 w-full">
            <div className="min-h-screen bg-linear-to-r from-[#efe8ff] via-[#f8f5ff] to-[#ddd3ff] flex items-center justify-center p-4 sm:p-6">

                <div className="w-full max-w-md lg:max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden border-grey-500 outline outline-[#81202022]">

                    <div className="flex flex-col lg:flex-row lg:h-[602px]">

                        {/* Left */}

                        <div className="w-full lg:w-1/2 flex flex-col relative">

                            <div className="absolute top-0 left-0  z-20 bg-mist-100 p-2.5 rounded-br-2xl w-47 " >
                                <img src={logo} alt="Azad Foundation Logo" className="w-47" />
                            </div>

                            <Swiper modules={[Autoplay]} loop={true} autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }} className="w-full h-full">

                                {images.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <img
                                            src={image}
                                            alt={`Slide ${index + 1}`}
                                            className="w-full h-64 sm:h-80 lg:h-[554px] object-cover"
                                        />
                                    </SwiperSlide>
                                ))}

                            </Swiper>
                            <div className="min-h-12 bg-[#7e2081] flex items-center justify-center text-center">
                                <p
                                    style={{ fontFamily: "Lora, serif" }}
                                    className="text-white italic text-base lg:text-[17.5px] font-bold"
                                >
                                    Livelihoods with dignity for women
                                </p>

                            </div>
                        </div>

                        {/* Right */}

                        <div className="w-full lg:w-1/2 flex items-center justify-center lg:overflow-y-auto">

                            <div className="grow p-6 sm:p-8 md:p-12 w-full">

                                <div className="w-auto">

                                    <h4 className="text-3xl font-bold text-gray-900">
                                        Login
                                    </h4>

                                    <h6 className="mt-1 text-sm">
                                        <span className="font-bold text-[#7e2081]">
                                            Welcome &amp; sign in
                                        </span>
                                    </h6>

                                    <hr className="my-6 border-gray-300" />
                                    {message && (
                                        <div className="bg-red-100 text-red-700 border border-red-300 rounded-md px-4 py-2 mb-4 text-sm">
                                            {message}
                                        </div>
                                    )}

                                    <form className="space-y-1" onSubmit={handleSubmit(onSubmit)}>
                                        <div className="mb-2">
                                            <label htmlFor="username" className="form-label">Username <span className="text-danger">*</span></label>
                                            <input type="text" id="username" className={`form-control ${errors.username ? 'border-red-500' : ''}`}
                                                {...register("username", { required: "Username is required" })}
                                                autoFocus
                                                placeholder="Enter username"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label htmlFor="pwd" className="form-label">Password <span className="text-danger">*</span></label>
                                            <div className="input-group auth-pass-inputgroup">
                                                <input type={showPassword ? "text" : "password"} className={`form-control border-end-0 ${errors.password ? 'border-red-500' : ''}`}
                                                    autoFocus
                                                    id="pwd"
                                                    placeholder="Enter password"
                                                    aria-label="Password"
                                                    aria-describedby="togglePassword"
                                                    {...register("password", { required: "Password is required" })}
                                                />
                                                <button className="btn btn-primary shadow-none ms-0  bg-[#7e2081] rounded-r-lg hover:bg-[#6a1c6d] focus:outline-none focus:ring-2 focus:ring-[#7e2081]" type="button" onClick={() => setShowPassword((prev) => !prev)} id="togglePassword">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                                        </div>

                                        <div className="mb-2">
                                            <label htmlFor="captcha" className="form-label">Solve: <strong>{captchaQuestion}</strong></label>
                                            <input
                                                type="number"
                                                id="captcha"
                                                placeholder="Enter your answer"
                                                autoComplete="off"
                                                className={`form-control ${errors.captcha ? 'border-red-500' : ''}`}
                                                {...register("captcha", {
                                                    required: "Please solve the captcha"
                                                })}
                                            />
                                        </div>

                                        <button type="submit" className="btn btn-primary w-100 py-2  bg-[#7e2081] text-white font-medium rounded-lg hover:bg-[#6a1c6d] disabled:opacity-50 transition-all duration-300" id="loginBtn" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Please wait...
                                                </div>
                                            ) : (
                                                <span className="btn-text">Login</span>
                                            )}
                                        </button>
                                        <span className="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>

                                        <div className=" mt-3 text-center">
                                            <p className="text-muted">
                                                {/* <a href="/forgot-password" className="text-primary text-decoration-none fw-semibold">Forgot password?
                                                </a> */}
                                                {/* <Link to="/forgot-password" className="text-primary text-decoration-none fw-semibold">Forgot password?</Link>    */}

                                                <Link to="/NotFound" className="text-primary text-decoration-none fw-semibold">Forgot password?</Link>

                                            </p>
                                        </div>
                                        <div className=" text-center">
                                            <small className="text-muted ">Technology Partner: <a href="https://www.indevconsultancy.com" target="_blank" className="text-primary text-decoration-none">Indev Consultancy Pvt Ltd.</a></small>
                                        </div>
                                        <div className="text-center">
                                            <ul className="mb-0 d-flex gap-4 flex-center p-0 text-500 justify-center list-unstyled">
                                                <small>
                                                    <a href="http://127.0.0.1:8000/disclaimer_Azad_LMS" target="_blank" className="text-decoration-none text-primary">
                                                        Disclaimer
                                                    </a>

                                                </small> |

                                                <small><a href="http://127.0.0.1:8000/privacy_policy_azad_LMS" target="_blank" className="text-decoration-none text-primary">Privacy Policy</a></small>
                                            </ul>
                                        </div>
                                    </form>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );

}
