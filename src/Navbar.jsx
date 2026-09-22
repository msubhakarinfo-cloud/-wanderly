import { useState } from "react";

function Navbar({
    darkMode,
    setDarkMode,
    scrollToSection
}) {
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [authMessage, setAuthMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [loggedInUser, setLoggedInUser] =
        useState(() => {
            const savedUser =
                localStorage.getItem("wanderlyUser");

            if (savedUser) {
                try {
                    return JSON.parse(savedUser);
                } catch {
                    return null;
                }
            }

            return null;
        });

    const openLogin = () => {
        setAuthMode("login");
        setName("");
        setEmail("");
        setPassword("");
        setAuthMessage("");
        setShowAuth(true);
    };

    const openRegister = () => {
        setAuthMode("register");
        setName("");
        setEmail("");
        setPassword("");
        setAuthMessage("");
        setShowAuth(true);
    };

    const closeAuth = () => {
        setShowAuth(false);
        setAuthMessage("");
    };

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email.trim()) {
            setAuthMessage("Please enter your email.");
            return;
        }

        if (!password) {
            setAuthMessage("Please enter your password.");
            return;
        }

        try {
            setLoading(true);
            setAuthMessage("Logging in...");

            const response = await fetch(
                "http://localhost:5000/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setAuthMessage(
                    data.message || "Login failed."
                );
                return;
            }

            localStorage.setItem(
                "wanderlyUserToken",
                data.token
            );

            localStorage.setItem(
                "wanderlyUser",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "wanderlyUserEmail",
                data.user.email
            );

            setLoggedInUser(data.user);

            setAuthMessage("Login successful!");

            setTimeout(() => {
                setShowAuth(false);
                setAuthMessage("");
                setPassword("");
            }, 700);

        } catch (error) {
            console.error("Login error:", error);

            setAuthMessage(
                "Unable to connect to Wanderly server."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setAuthMessage("Please enter your name.");
            return;
        }

        if (!email.trim()) {
            setAuthMessage("Please enter your email.");
            return;
        }

        if (!password) {
            setAuthMessage("Please enter a password.");
            return;
        }

        if (password.length < 6) {
            setAuthMessage(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);
            setAuthMessage(
                "Creating your account..."
            );

            const response = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setAuthMessage(
                    data.message ||
                    "Registration failed."
                );
                return;
            }

            setAuthMessage(
                "Account created successfully! Please login."
            );

            setTimeout(() => {
                setAuthMode("login");
                setPassword("");
                setAuthMessage(
                    "Account created. Please login."
                );
            }, 800);

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setAuthMessage(
                "Unable to connect to Wanderly server."
            );

        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(
            "wanderlyUserToken"
        );

        localStorage.removeItem(
            "wanderlyUser"
        );

        localStorage.removeItem(
            "wanderlyUserEmail"
        );

        setLoggedInUser(null);
    };

    const goToMyBookings = () => {
        window.location.href =
            "/my-bookings";
    };

    const authStyles = `
        .wanderly-auth-overlay {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.68);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 99999;
            backdrop-filter: blur(7px);
        }

        .wanderly-auth-modal {
            position: relative;
            width: 100%;
            max-width: 440px;
            max-height: 90vh;
            overflow-y: auto;
            background: #ffffff;
            color: #172033;
            border-radius: 22px;
            padding: 38px;
            box-shadow:
                0 30px 90px rgba(0, 0, 0, 0.35);
            animation: wanderlyAuthAppear 0.25s ease;
        }

        @keyframes wanderlyAuthAppear {
            from {
                opacity: 0;
                transform: translateY(25px) scale(0.96);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .wanderly-auth-close {
            position: absolute;
            top: 15px;
            right: 17px;
            width: 38px;
            height: 38px;
            border: none;
            border-radius: 50%;
            background: #f1f5f9;
            color: #334155;
            font-size: 26px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .wanderly-auth-close:hover {
            background: #e2e8f0;
        }

        .wanderly-auth-header {
            text-align: center;
            margin-bottom: 25px;
        }

        .wanderly-auth-brand {
            display: block;
            color: #0f766e;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 2px;
            margin-bottom: 9px;
        }

        .wanderly-auth-header h2 {
            margin: 0 0 9px;
            color: #172033;
            font-size: 30px;
            font-weight: 800;
        }

        .wanderly-auth-header p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }

        .wanderly-auth-message {
            padding: 12px 14px;
            margin-bottom: 18px;
            border-radius: 10px;
            background: #fee2e2;
            color: #991b1b;
            text-align: center;
            font-size: 14px;
            line-height: 1.4;
        }

        .wanderly-auth-message.success {
            background: #dcfce7;
            color: #166534;
        }

        .wanderly-auth-form {
            display: flex;
            flex-direction: column;
            gap: 9px;
        }

        .wanderly-auth-form label {
            color: #374151;
            font-size: 14px;
            font-weight: 700;
            margin-top: 6px;
        }

        .wanderly-auth-form input {
            width: 100%;
            padding: 14px 15px;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            outline: none;
            background: #ffffff;
            color: #172033;
            font-size: 15px;
            box-sizing: border-box;
        }

        .wanderly-auth-form input:focus {
            border-color: #0f766e;
            box-shadow:
                0 0 0 3px rgba(15, 118, 110, 0.12);
        }

        .wanderly-auth-submit {
            width: 100%;
            margin-top: 14px;
            padding: 14px;
            border: none;
            border-radius: 10px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
        }

        .wanderly-auth-submit:hover {
            background: #115e59;
        }

        .wanderly-auth-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .wanderly-auth-switch {
            margin-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }

        .wanderly-auth-switch button {
            border: none;
            background: transparent;
            color: #0f766e;
            font-weight: 800;
            cursor: pointer;
            margin-left: 5px;
            font-size: 14px;
        }

        .wanderly-auth-switch button:hover {
            text-decoration: underline;
        }

        @media (max-width: 520px) {
            .wanderly-auth-overlay {
                padding: 15px;
            }

            .wanderly-auth-modal {
                padding: 30px 22px;
            }

            .wanderly-auth-header h2 {
                font-size: 26px;
            }
        }
    `;

    return (
        <>
            <style>
                {authStyles}
            </style>

            <nav className="navbar">

                <div className="nav-container">

                    <button
                        className="logo"
                        onClick={() =>
                            scrollToSection("home")
                        }
                    >
                        Wanderly
                    </button>

                    <ul className="nav-menu">

                        <li>
                            <button
                                onClick={() =>
                                    scrollToSection("home")
                                }
                            >
                                Home
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() =>
                                    scrollToSection(
                                        "destinations"
                                    )
                                }
                            >
                                Destinations
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() =>
                                    scrollToSection("tours")
                                }
                            >
                                Tours
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() =>
                                    scrollToSection("about")
                                }
                            >
                                About
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() =>
                                    scrollToSection("contact")
                                }
                            >
                                Contact
                            </button>
                        </li>

                    </ul>

                    <div className="nav-buttons">

                        <button
                            className="theme-toggle"
                            onClick={() =>
                                setDarkMode(!darkMode)
                            }
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>

                        {loggedInUser ? (

                            <>
                                <button
                                    className="login-btn"
                                    onClick={
                                        goToMyBookings
                                    }
                                >
                                    My Bookings
                                </button>

                                <button
                                    className="explore-btn"
                                    onClick={logout}
                                >
                                    Logout
                                </button>
                            </>

                        ) : (

                            <>
                                <button
                                    className="login-btn"
                                    onClick={openLogin}
                                >
                                    Login
                                </button>

                                <button
                                    className="explore-btn"
                                    onClick={openRegister}
                                >
                                    Register
                                </button>
                            </>

                        )}

                    </div>

                </div>

            </nav>

            {showAuth && (

                <div
                    className="wanderly-auth-overlay"
                    onClick={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAuth();
                        }
                    }}
                >

                    <div className="wanderly-auth-modal">

                        <button
                            className="wanderly-auth-close"
                            onClick={closeAuth}
                        >
                            ×
                        </button>

                        <div className="wanderly-auth-header">

                            <span className="wanderly-auth-brand">
                                WANDERLY
                            </span>

                            <h2>
                                {authMode === "login"
                                    ? "Welcome Back"
                                    : "Create Account"}
                            </h2>

                            <p>
                                {authMode === "login"
                                    ? "Login to manage your trips."
                                    : "Start planning your next journey."}
                            </p>

                        </div>

                        {authMessage && (

                            <div
                                className={
                                    authMessage
                                        .toLowerCase()
                                        .includes("successful")
                                        ? "wanderly-auth-message success"
                                        : "wanderly-auth-message"
                                }
                            >
                                {authMessage}
                            </div>

                        )}

                        {authMode === "login" ? (

                            <form
                                className="wanderly-auth-form"
                                onSubmit={handleLogin}
                            >

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="email"
                                />

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="current-password"
                                />

                                <button
                                    type="submit"
                                    className="wanderly-auth-submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </button>

                                <div className="wanderly-auth-switch">

                                    Don't have an account?

                                    <button
                                        type="button"
                                        onClick={openRegister}
                                    >
                                        Register
                                    </button>

                                </div>

                            </form>

                        ) : (

                            <form
                                className="wanderly-auth-form"
                                onSubmit={handleRegister}
                            >

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="name"
                                />

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="email"
                                />

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                />

                                <button
                                    type="submit"
                                    className="wanderly-auth-submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </button>

                                <div className="wanderly-auth-switch">

                                    Already have an account?

                                    <button
                                        type="button"
                                        onClick={openLogin}
                                    >
                                        Login
                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </div>

            )}

        </>
    );
}

export default Navbar;