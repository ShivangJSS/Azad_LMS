import React, { useState, useEffect } from "react";
import "./Login.css";

import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import logo from "../../assets/Azadlogo.png";

import slide1 from "../../assets/login1.png";
import slide2 from "../../assets/login2.png";
import slide3 from "../../assets/login3.png";

const images = [slide1, slide2, slide3];

export default function Login() {

    /* ==============================
       IMAGE SLIDESHOW
    =============================== */

    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {

        const interval = setInterval(() => {

            setCurrentImage((prev) => (prev + 1) % images.length);

        }, 2000);

        return () => clearInterval(interval);

    }, []);

    /* ==============================
       PASSWORD TOGGLE
    =============================== */

    const [showPassword, setShowPassword] = useState(false);

    /* ==============================
       CAPTCHA
    =============================== */

    const generateCaptcha = () => {

        const a = Math.floor(Math.random() * 10) + 10;
        const b = Math.floor(Math.random() * 9) + 1;

        return {
            a,
            b,
            answer: a - b
        };

    };

    const [captcha, setCaptcha] = useState(generateCaptcha());

    /* ==============================
       SUCCESS / ERROR
    =============================== */

    const [message, setMessage] = useState("");

    /* ==============================
       FORM
    =============================== */

    const {

        register,
        handleSubmit,
        setError,
        formState: { errors }

    } = useForm();

    /* ==============================
       LOGIN
    =============================== */

    const onSubmit = (data) => {

        if (parseInt(data.captcha) !== captcha.answer) {

            setError("captcha", {

                type: "manual",
                message: "Incorrect captcha answer."

            });

            setCaptcha(generateCaptcha());

            return;
        }

        console.log(data);

        setMessage("Login Successful!");

        // TODO:
        // Axios Login API
        // Store JWT
        // Redirect Dashboard

    };

    return (

        <div className="login-page">

            <div className="login-container">

                {/* ======================================
                    LEFT PANEL
                ======================================= */}

                <div className="left-panel">

                    <div className="logo-box">

                        <img
                            src={logo}
                            alt="Azad Foundation"
                        />

                    </div>

                    <img
                        src={images[currentImage]}
                        alt="Banner"
                        className="banner-image"
                    />

                    <div className="image-footer">

                        Livelihoods with dignity for women

                    </div>

                </div>

                {/* ======================================
                    RIGHT PANEL
                ======================================= */}

                <div className="right-panel">

                    <div className="login-card">

                        <h1 className="login-title">
                            Login
                        </h1>

                        <h5 className="login-subtitle">
                            Welcome & Sign In
                        </h5>

                        {message && (

                            <div className="success">

                                {message}

                            </div>

                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                        >

                            {/* ===========================
                               USERNAME
                            ============================ */}

                            <label>

                                Username <span>*</span>

                            </label>

                            <input

                                type="text"

                                placeholder="Enter username"

                                {...register("username", {

                                    required: "Username is required"

                                })}

                            />

                            {errors.username && (

                                <small className="error">

                                    {errors.username.message}

                                </small>

                            )}

                            {/* ===========================
                               PASSWORD
                            ============================ */}

                            <label>

                                Password <span>*</span>

                            </label>

                            <div className="password">

                                <input

                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }

                                    placeholder="Enter password"

                                    {...register("password", {

                                        required:
                                            "Password is required"

                                    })}

                                />

                                <button

                                    type="button"

                                    className="password-btn"

                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }

                                >

                                    {showPassword ? (

                                        <FaEyeSlash />

                                    ) : (

                                        <FaEye />

                                    )}

                                </button>

                            </div>

                            {errors.password && (

                                <small className="error">

                                    {errors.password.message}

                                </small>

                            )}

                            {/* Continue in Part 2 */}
                                                        {/* ===========================
                               CAPTCHA
                            ============================ */}

                            <div className="captcha">

                                <label>

                                    Solve:

                                    <strong>

                                        {captcha.a} - {captcha.b} = ?

                                    </strong>

                                </label>

                            </div>

                            <input

                                type="number"

                                placeholder="Enter your answer"

                                {...register("captcha", {

                                    required: "Captcha is required"

                                })}

                            />

                            {errors.captcha && (

                                <small className="error">

                                    {errors.captcha.message}

                                </small>

                            )}

                            {/* ===========================
                               LOGIN BUTTON
                            ============================ */}

                            <button
                                type="submit"
                                className="login-btn"
                            >

                                Login

                            </button>

                        </form>

                        {/* ===========================
                           FORGOT PASSWORD
                        ============================ */}

                        <a
                            href="#"
                            className="forgot"
                        >

                            Forgot password?

                        </a>

                        {/* ===========================
                           FOOTER
                        ============================ */}

                        <div className="footer">

                            <div>

                                Technology Partner:

                                <span>

                                    {" "}Indev Consultancy Pvt. Ltd.

                                </span>

                            </div>

                            <div className="links">

                                <a href="#">

                                    Disclaimer

                                </a>

                                <span>|</span>

                                <a href="#">

                                    Privacy Policy

                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}