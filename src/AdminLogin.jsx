import { useState } from "react";

function AdminLogin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);


    /* =====================================================
       ADMIN LOGIN
       ===================================================== */

    const handleLogin = async (event) => {

        event.preventDefault();

        setMessage("");
        setLoading(true);


        try {

            const response = await fetch(
                "http://localhost:5000/api/admin/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email:
                            email.trim(),

                        password:
                            password

                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Login failed."
                );

                setLoading(false);

                return;
            }


            /* -----------------------------------------
               SAVE ADMIN LOGIN
               ----------------------------------------- */

            localStorage.setItem(
                "wanderlyAdminToken",
                data.token
            );


            localStorage.setItem(
                "wanderlyAdmin",
                JSON.stringify(
                    data.admin
                )
            );


            /* -----------------------------------------
               GO TO ADMIN DASHBOARD
               ----------------------------------------- */

            window.location.href =
                "/admin";


        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            setMessage(
                "Unable to connect to the server."
            );

        }


        setLoading(false);

    };


    /* =====================================================
       PAGE
       ===================================================== */

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(135deg, #111827, #374151)",
                padding: "20px",
                boxSizing: "border-box"
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "430px",
                    background: "white",
                    borderRadius: "18px",
                    padding: "40px",
                    boxSizing: "border-box",
                    boxShadow:
                        "0 20px 60px rgba(0,0,0,0.25)"
                }}
            >

                {/* =================================================
                    LOGO
                ================================================= */}

                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px"
                    }}
                >

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "34px",
                            color: "#ff6b35"
                        }}
                    >
                        Wanderly
                    </h1>

                    <p
                        style={{
                            margin:
                                "8px 0 0",
                            color: "#64748b"
                        }}
                    >
                        Admin Portal
                    </p>

                </div>


                {/* =================================================
                    TITLE
                ================================================= */}

                <h2
                    style={{
                        margin:
                            "0 0 8px",
                        textAlign: "center",
                        color: "#111827"
                    }}
                >
                    Admin Login
                </h2>

                <p
                    style={{
                        textAlign: "center",
                        color: "#64748b",
                        marginBottom: "25px"
                    }}
                >
                    Sign in to manage Wanderly bookings.
                </p>


                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form
                    onSubmit={handleLogin}
                >

                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                            color: "#374151"
                        }}
                    >
                        Email Address
                    </label>

                    <input
                        type="email"
                        placeholder="Enter admin email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                        required
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "13px 14px",
                            border:
                                "1px solid #d1d5db",
                            borderRadius: "9px",
                            fontSize: "15px",
                            marginBottom: "18px",
                            outline: "none"
                        }}
                    />


                    <label
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                            color: "#374151"
                        }}
                    >
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                        required
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "13px 14px",
                            border:
                                "1px solid #d1d5db",
                            borderRadius: "9px",
                            fontSize: "15px",
                            marginBottom: "20px",
                            outline: "none"
                        }}
                    />


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {message && (

                        <div
                            style={{
                                background:
                                    "#fee2e2",
                                color:
                                    "#991b1b",
                                padding:
                                    "12px",
                                borderRadius:
                                    "8px",
                                marginBottom:
                                    "18px",
                                fontSize:
                                    "14px"
                            }}
                        >
                            {message}
                        </div>

                    )}


                    {/* =================================================
                        LOGIN BUTTON
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            border: "none",
                            borderRadius: "9px",
                            background:
                                loading
                                    ? "#9ca3af"
                                    : "#ff6b35",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor:
                                loading
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                    >
                        {loading
                            ? "Signing in..."
                            : "Login"}
                    </button>

                </form>


                {/* =================================================
                    BACK TO WEBSITE
                ================================================= */}

                <button
                    type="button"
                    onClick={() =>
                        window.location.href = "/"
                    }
                    style={{
                        width: "100%",
                        marginTop: "15px",
                        padding: "12px",
                        border:
                            "1px solid #d1d5db",
                        borderRadius: "9px",
                        background: "white",
                        color: "#374151",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}
                >
                    ← Back to Website
                </button>

            </div>

        </div>

    );
}

export default AdminLogin;