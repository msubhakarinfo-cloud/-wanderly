import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./TourFix.css";

import App from "./App.jsx";
import Admin from "./Admin.jsx";
import AdminLogin from "./AdminLogin.jsx";
import MyBookings from "./MyBookings.jsx";

const root =
    createRoot(
        document.getElementById("root")
    );

const adminToken =
    localStorage.getItem(
        "wanderlyAdminToken"
    );

if (
    window.location.pathname ===
    "/admin"
) {

    if (adminToken) {

        root.render(
            <StrictMode>
                <Admin />
            </StrictMode>
        );

    } else {

        root.render(
            <StrictMode>
                <AdminLogin />
            </StrictMode>
        );

    }

} else if (
    window.location.pathname ===
    "/my-bookings"
) {

    root.render(
        <StrictMode>
            <MyBookings />
        </StrictMode>
    );

} else {

    root.render(
        <StrictMode>
            <App />
        </StrictMode>
    );

}