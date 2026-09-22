import { useEffect, useState } from "react";

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token =
        localStorage.getItem("wanderlyUserToken");

    useEffect(() => {
        const fetchBookings = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:5000/api/my-bookings",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    setError(
                        data.message ||
                            "Unable to load bookings."
                    );

                    setLoading(false);
                    return;
                }

                setBookings(data);
            } catch (err) {
                console.error(
                    "Bookings error:",
                    err
                );

                setError(
                    "Unable to connect to Wanderly server."
                );
            }

            setLoading(false);
        };

        fetchBookings();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem(
            "wanderlyUserToken"
        );

        localStorage.removeItem(
            "wanderlyUser"
        );

        localStorage.removeItem(
            "wanderlyUserEmail"
        );

        window.location.href = "/";
    };

    if (!token) {
        return (
            <div className="my-bookings-page">
                <div className="my-bookings-box">
                    <h1>
                        Login Required
                    </h1>

                    <p>
                        Please login to view your bookings.
                    </p>

                    <button
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        Back to Wanderly
                    </button>
                </div>

                <style>{`
                    .my-bookings-page {
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 40px;
                        background: #f5f7fb;
                        font-family: Arial, sans-serif;
                    }

                    .my-bookings-box {
                        width: 100%;
                        max-width: 500px;
                        background: white;
                        padding: 45px;
                        border-radius: 20px;
                        text-align: center;
                        box-shadow: 0 15px 40px rgba(0,0,0,0.08);
                    }

                    .my-bookings-box h1 {
                        margin-bottom: 12px;
                    }

                    .my-bookings-box p {
                        color: #666;
                        margin-bottom: 25px;
                    }

                    .my-bookings-box button {
                        border: none;
                        background: #111827;
                        color: white;
                        padding: 13px 24px;
                        border-radius: 10px;
                        cursor: pointer;
                        font-size: 15px;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="my-bookings-container">

                <div className="bookings-header">
                    <div>
                        <span>
                            WANDERLY
                        </span>

                        <h1>
                            My Bookings
                        </h1>

                        <p>
                            View your confirmed trips
                            and payment details.
                        </p>
                    </div>

                    <div className="header-buttons">
                        <button
                            onClick={() => {
                                window.location.href =
                                    "/";
                            }}
                            className="back-button"
                        >
                            Back to Site
                        </button>

                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="status-box">
                        Loading your bookings...
                    </div>
                )}

                {!loading && error && (
                    <div className="status-box error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    bookings.length === 0 && (
                        <div className="empty-box">
                            <div className="empty-icon">
                                ✈️
                            </div>

                            <h2>
                                No bookings yet
                            </h2>

                            <p>
                                Your confirmed trips
                                will appear here.
                            </p>

                            <button
                                onClick={() => {
                                    window.location.href =
                                        "/";
                                }}
                            >
                                Explore Tours
                            </button>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    bookings.length > 0 && (
                        <div className="booking-list">
                            {bookings.map(
                                (booking) => (
                                    <div
                                        className="booking-card"
                                        key={
                                            booking._id
                                        }
                                    >
                                        <div className="booking-top">
                                            <div>
                                                <span className="booking-label">
                                                    TOUR
                                                </span>

                                                <h2>
                                                    {
                                                        booking.tourName
                                                    }
                                                </h2>
                                            </div>

                                            <span className="confirmed">
                                                ✓ Confirmed
                                            </span>
                                        </div>

                                        <div className="booking-details">

                                            <div>
                                                <span>
                                                    Travel Date
                                                </span>

                                                <strong>
                                                    {
                                                        booking.travelDate
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Travellers
                                                </span>

                                                <strong>
                                                    {
                                                        booking.travellers
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Total Paid
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        booking.totalAmount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Payment
                                                </span>

                                                <strong className="paid">
                                                    {booking.paymentStatus ||
                                                        "Paid"}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="booking-footer">

                                            <span>
                                                Booking ID:
                                                {" "}
                                                {
                                                    booking._id
                                                }
                                            </span>

                                            {booking.razorpayPaymentId && (
                                                <span>
                                                    Payment ID:
                                                    {" "}
                                                    {
                                                        booking.razorpayPaymentId
                                                    }
                                                </span>
                                            )}

                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
            </div>

            <style>{`
                * {
                    box-sizing: border-box;
                }

                .my-bookings-page {
                    min-height: 100vh;
                    background: #f5f7fb;
                    padding: 50px 25px;
                    font-family: Arial, sans-serif;
                    color: #111827;
                }

                .my-bookings-container {
                    width: 100%;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .bookings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .bookings-header span {
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                .bookings-header h1 {
                    margin: 8px 0;
                    font-size: 42px;
                }

                .bookings-header p {
                    margin: 0;
                    color: #6b7280;
                    font-size: 16px;
                }

                .header-buttons {
                    display: flex;
                    gap: 10px;
                }

                .header-buttons button {
                    border: none;
                    padding: 12px 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .back-button {
                    background: #111827;
                    color: white;
                }

                .logout-button {
                    background: #e5e7eb;
                    color: #111827;
                }

                .status-box,
                .empty-box {
                    background: white;
                    border-radius: 20px;
                    padding: 50px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                }

                .status-box.error {
                    color: #b91c1c;
                }

                .empty-icon {
                    font-size: 50px;
                    margin-bottom: 15px;
                }

                .empty-box h2 {
                    margin-bottom: 10px;
                }

                .empty-box p {
                    color: #6b7280;
                    margin-bottom: 25px;
                }

                .empty-box button {
                    border: none;
                    background: #111827;
                    color: white;
                    padding: 13px 24px;
                    border-radius: 10px;
                    cursor: pointer;
                }

                .booking-list {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                .booking-card {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                }

                .booking-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                    padding-bottom: 22px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .booking-label {
                    font-size: 11px;
                    letter-spacing: 2px;
                    color: #6b7280;
                    font-weight: 700;
                }

                .booking-top h2 {
                    margin: 8px 0 0;
                    font-size: 25px;
                }

                .confirmed {
                    background: #dcfce7;
                    color: #166534;
                    padding: 8px 14px;
                    border-radius: 30px;
                    font-size: 13px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .booking-details {
                    display: grid;
                    grid-template-columns:
                        repeat(4, 1fr);
                    gap: 20px;
                    padding: 25px 0;
                }

                .booking-details div {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .booking-details span {
                    color: #6b7280;
                    font-size: 13px;
                }

                .booking-details strong {
                    font-size: 16px;
                }

                .booking-details .paid {
                    color: #15803d;
                }

                .booking-footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #9ca3af;
                    font-size: 12px;
                    word-break: break-all;
                }

                @media (max-width: 800px) {
                    .bookings-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .booking-details {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }
                }

                @media (max-width: 500px) {
                    .my-bookings-page {
                        padding: 25px 15px;
                    }

                    .bookings-header h1 {
                        font-size: 32px;
                    }

                    .header-buttons {
                        width: 100%;
                    }

                    .header-buttons button {
                        flex: 1;
                    }

                    .booking-details {
                        grid-template-columns: 1fr;
                    }

                    .booking-top {
                        flex-direction: column;
                    }

                    .booking-footer {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}

export default MyBookings;