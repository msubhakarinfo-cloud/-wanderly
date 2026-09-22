import { useEffect, useState } from "react";
import "./index.css";

function Admin() {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const adminData = JSON.parse(
        localStorage.getItem(
            "wanderlyAdmin"
        ) || "{}"
    );

    const fetchBookings = async () => {

        setLoading(true);
        setMessage("");

        const token =
            localStorage.getItem(
                "wanderlyAdminToken"
            );

        if (!token) {

            window.location.href =
                "/admin";

            return;
        }

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/bookings",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "wanderlyAdminToken"
                );

                localStorage.removeItem(
                    "wanderlyAdmin"
                );

                window.location.href =
                    "/admin";

                return;
            }

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Unable to load bookings."
                );

                setLoading(false);

                return;
            }

            setBookings(
                data.bookings || []
            );

        } catch (error) {

            console.error(
                "Booking fetch error:",
                error
            );

            setMessage(
                "Unable to connect to the server."
            );
        }

        setLoading(false);
    };

    useEffect(() => {

        fetchBookings();

    }, []);

    const logout = () => {

        localStorage.removeItem(
            "wanderlyAdminToken"
        );

        localStorage.removeItem(
            "wanderlyAdmin"
        );

        window.location.href =
            "/admin";
    };

    const totalBookings =
        bookings.length;

    const totalTravellers =
        bookings.reduce(
            (total, booking) =>
                total +
                Number(
                    booking.travellers || 0
                ),
            0
        );

    const totalRevenue =
        bookings.reduce(
            (total, booking) =>
                total +
                Number(
                    booking.totalAmount || 0
                ),
            0
        );

    return (

        <div className="admin-page">

            <header className="admin-header">

                <div>

                    <div className="admin-logo">
                        Wander<span>ly</span>
                    </div>

                    <p>
                        Administration Dashboard
                    </p>

                </div>

                <div className="admin-header-actions">

                    <button
                        onClick={() =>
                            window.location.href =
                                "/"
                        }
                    >
                        View Website
                    </button>

                    <button
                        onClick={logout}
                        className="admin-logout"
                    >
                        Logout
                    </button>

                </div>

            </header>

            <main className="admin-container">

                <div className="admin-welcome">

                    <div>

                        <span>
                            ADMIN PANEL
                        </span>

                        <h1>
                            Welcome back,
                            {" "}
                            {adminData.name ||
                                "Administrator"}
                        </h1>

                        <p>
                            Manage Wanderly
                            bookings and
                            reservations.
                        </p>

                    </div>

                    <button
                        onClick={fetchBookings}
                        className="refresh-button"
                    >
                        ↻ Refresh
                    </button>

                </div>

                {message && (

                    <div className="admin-message">
                        {message}
                    </div>

                )}

                <section className="admin-stats">

                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            📋
                        </div>

                        <div>

                            <span>
                                Total Bookings
                            </span>

                            <strong>
                                {totalBookings}
                            </strong>

                        </div>

                    </div>

                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            👥
                        </div>

                        <div>

                            <span>
                                Total Travellers
                            </span>

                            <strong>
                                {totalTravellers}
                            </strong>

                        </div>

                    </div>

                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            ₹
                        </div>

                        <div>

                            <span>
                                Booking Value
                            </span>

                            <strong>
                                ₹
                                {totalRevenue.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                    </div>

                </section>

                <section className="admin-bookings">

                    <div className="admin-section-header">

                        <div>

                            <span>
                                RESERVATIONS
                            </span>

                            <h2>
                                All Bookings
                            </h2>

                        </div>

                        <div className="booking-count">

                            {totalBookings}
                            {" "}
                            booking
                            {totalBookings !== 1
                                ? "s"
                                : ""}

                        </div>

                    </div>

                    {loading ? (

                        <div className="admin-empty">

                            Loading bookings...

                        </div>

                    ) : bookings.length === 0 ? (

                        <div className="admin-empty">

                            <div>
                                📭
                            </div>

                            <h3>
                                No bookings yet
                            </h3>

                            <p>
                                New customer
                                bookings will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="booking-table-wrapper">

                            <table className="booking-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Tour
                                        </th>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Travel Date
                                        </th>

                                        <th>
                                            Travellers
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {bookings.map(
                                        (booking) => (

                                            <tr
                                                key={
                                                    booking._id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            booking.tourName
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        booking.customerName
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        booking.customerEmail
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        booking.travelDate
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        booking.travellers
                                                    }
                                                </td>

                                                <td>

                                                    <strong className="booking-price">

                                                        ₹
                                                        {Number(
                                                            booking.totalAmount ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </strong>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Admin;