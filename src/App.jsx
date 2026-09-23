import { useState } from "react";

import "./App.css";

import Navbar from "./Navbar";


const API_BASE_URL =
    "https://wanderly-backend-z1xt.onrender.com";


function App() {

    /* =====================================================
       GENERAL STATES
    ===================================================== */

    const [darkMode, setDarkMode] =
        useState(false);

    const [destination, setDestination] =
        useState("");

    const [travelDate, setTravelDate] =
        useState("");

    const [travellers, setTravellers] =
        useState("1");

    const [searchMessage, setSearchMessage] =
        useState("");

    const [activeFilter, setActiveFilter] =
        useState("All");


    /* =====================================================
       BOOKING STATES
    ===================================================== */

    const [showBooking, setShowBooking] =
        useState(false);

    const [selectedTour, setSelectedTour] =
        useState(null);

    const [bookingName, setBookingName] =
        useState("");

    const [bookingEmail, setBookingEmail] =
        useState("");

    const [bookingDate, setBookingDate] =
        useState("");

    const [bookingTravellers, setBookingTravellers] =
        useState("1");

    const [bookingMessage, setBookingMessage] =
        useState("");

    const [processingPayment, setProcessingPayment] =
        useState(false);


    /* =====================================================
       SCROLL
    ===================================================== */

    const scrollToSection = (sectionId) => {

        const section =
            document.getElementById(sectionId);

        if (section) {

            section.scrollIntoView({
                behavior: "smooth"
            });

        }

    };


    /* =====================================================
       SEARCH
    ===================================================== */

    const handleSearch = (event) => {

        event.preventDefault();

        if (!destination.trim()) {

            setSearchMessage(
                "Please enter a destination."
            );

            return;

        }

        if (!travelDate) {

            setSearchMessage(
                "Please select a travel date."
            );

            return;

        }

        setSearchMessage(
            `Searching trips to ${destination} for ${travellers} traveller${travellers > 1 ? "s" : ""}.`
        );

    };


    /* =====================================================
       TOUR DATA
    ===================================================== */

    const tours = [

        {
            id: 1,

            title:
                "Goa Beach Escape",

            image:
                "/images/goa.jpg",

            category:
                "Beach",

            duration:
                "4 Days / 3 Nights",

            price:
                "₹14,999",

            description:
                "Relax on beautiful beaches and enjoy Goa's coastal lifestyle."
        },

        {
            id: 2,

            title:
                "Kashmir Mountain Journey",

            image:
                "/images/kashmir.jpg",

            category:
                "Mountain",

            duration:
                "6 Days / 5 Nights",

            price:
                "₹24,999",

            description:
                "Experience beautiful valleys, mountains and peaceful landscapes."
        },

        {
            id: 3,

            title:
                "Rajasthan Heritage Tour",

            image:
                "/images/Rajasthan.jpg",

            category:
                "Culture",

            duration:
                "5 Days / 4 Nights",

            price:
                "₹19,999",

            description:
                "Discover royal palaces, historic forts and local culture."
        },

        {
            id: 4,

            title:
                "Kerala Nature Escape",

            image:
                "/images/kerala.jpg",

            category:
                "Adventure",

            duration:
                "5 Days / 4 Nights",

            price:
                "₹18,999",

            description:
                "Explore backwaters, greenery and beautiful landscapes."
        }

    ];


    const filteredTours =
        activeFilter === "All"
            ? tours
            : tours.filter(
                (tour) =>
                    tour.category ===
                    activeFilter
            );


    /* =====================================================
       OPEN BOOKING
    ===================================================== */

    const openBooking = (tour) => {

        const token =
            localStorage.getItem(
                "wanderlyUserToken"
            );

        if (!token) {

            alert(
                "Please login before booking a tour."
            );

            return;

        }


        const savedUser =
            localStorage.getItem(
                "wanderlyUser"
            );

        let user = null;

        try {

            user =
                savedUser
                    ? JSON.parse(savedUser)
                    : null;

        } catch {

            user = null;

        }


        setSelectedTour(tour);

        setBookingName(
            user?.name || ""
        );

        setBookingEmail(
            user?.email ||
            localStorage.getItem(
                "wanderlyUserEmail"
            ) ||
            ""
        );

        setBookingDate("");

        setBookingTravellers("1");

        setBookingMessage("");

        setProcessingPayment(false);

        setShowBooking(true);

    };


    /* =====================================================
       CLOSE BOOKING
    ===================================================== */

    const closeBooking = () => {

        if (processingPayment) {
            return;
        }

        setShowBooking(false);

        setSelectedTour(null);

        setBookingMessage("");

        setProcessingPayment(false);

    };


    /* =====================================================
       LOAD RAZORPAY SCRIPT
    ===================================================== */

    const loadRazorpayScript = () => {

        return new Promise(
            (resolve) => {

                if (
                    window.Razorpay
                ) {

                    resolve(true);

                    return;

                }


                const existingScript =
                    document.querySelector(
                        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
                    );


                if (existingScript) {

                    existingScript.onload =
                        () => resolve(true);

                    existingScript.onerror =
                        () => resolve(false);

                    return;

                }


                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "https://checkout.razorpay.com/v1/checkout.js";

                script.async = true;

                script.onload =
                    () => resolve(true);

                script.onerror =
                    () => resolve(false);

                document.body.appendChild(
                    script
                );

            }
        );

    };


    /* =====================================================
       HANDLE PAYMENT
    ===================================================== */

    const handleBooking = async (
        event
    ) => {

        event.preventDefault();


        if (processingPayment) {
            return;
        }


        const token =
            localStorage.getItem(
                "wanderlyUserToken"
            );


        if (!token) {

            setBookingMessage(
                "Please login before making a payment."
            );

            return;

        }


        if (!bookingName.trim()) {

            setBookingMessage(
                "Please enter your name."
            );

            return;

        }


        if (!bookingEmail.trim()) {

            setBookingMessage(
                "Please enter your email."
            );

            return;

        }


        if (!bookingDate) {

            setBookingMessage(
                "Please select your travel date."
            );

            return;

        }


        if (!selectedTour) {

            setBookingMessage(
                "Please select a tour."
            );

            return;

        }


        try {

            setProcessingPayment(true);

            setBookingMessage(
                "Creating secure payment order..."
            );


            /* ---------------------------------------------
               STEP 1
               CREATE ORDER ON BACKEND
            --------------------------------------------- */

            const orderResponse =
                await fetch(
                    `${API_BASE_URL}/api/payment/order`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            tourId:
                                selectedTour.id,

                            travellers:
                                Number(
                                    bookingTravellers
                                ),

                            travelDate:
                                bookingDate

                        })
                    }
                );


            let orderData;

            try {

                orderData =
                    await orderResponse.json();

            } catch {

                throw new Error(
                    "The payment server returned an invalid response."
                );

            }


            if (!orderResponse.ok) {

                if (
                    orderResponse.status ===
                    401
                ) {

                    localStorage.removeItem(
                        "wanderlyUserToken"
                    );

                    localStorage.removeItem(
                        "wanderlyUser"
                    );

                    localStorage.removeItem(
                        "wanderlyUserEmail"
                    );

                    throw new Error(
                        "Your login session has expired. Please login again."
                    );

                }

                throw new Error(
                    orderData.message ||
                    "Unable to create payment order."
                );

            }


            /* ---------------------------------------------
               IMPORTANT

               Backend now returns:

               keyId
               orderId
               amount
               currency

               We use orderData.keyId here.
            --------------------------------------------- */

            const razorpayKey =
                orderData.keyId;


            const razorpayOrderId =
                orderData.orderId;


            if (!razorpayKey) {

                console.error(
                    "Razorpay key missing from backend response:",
                    orderData
                );

                throw new Error(
                    "Razorpay Key ID was not returned by the server."
                );

            }


            if (!razorpayOrderId) {

                throw new Error(
                    "Razorpay Order ID was not returned by the server."
                );

            }


            /* ---------------------------------------------
               STEP 2
               LOAD RAZORPAY
            --------------------------------------------- */

            setBookingMessage(
                "Opening secure payment..."
            );


            const razorpayLoaded =
                await loadRazorpayScript();


            if (!razorpayLoaded) {

                throw new Error(
                    "Unable to load Razorpay Checkout."
                );

            }


            if (!window.Razorpay) {

                throw new Error(
                    "Razorpay Checkout is unavailable."
                );

            }


            /* ---------------------------------------------
               STEP 3
               RAZORPAY CHECKOUT
            --------------------------------------------- */

            const options = {

                key:
                    razorpayKey,

                amount:
                    orderData.amount,

                currency:
                    orderData.currency ||
                    "INR",

                name:
                    "Wanderly",

                description:
                    selectedTour.title,

                order_id:
                    razorpayOrderId,

                prefill: {

                    name:
                        bookingName.trim(),

                    email:
                        bookingEmail.trim()

                },

                theme: {

                    color:
                        "#0f766e"

                },


                handler:
                    async function (
                        paymentResponse
                    ) {

                        try {

                            setBookingMessage(
                                "Verifying payment..."
                            );


                            /* -------------------------
                               STEP 4
                               VERIFY PAYMENT
                            ------------------------- */

                            const verifyResponse =
                                await fetch(
                                    `${API_BASE_URL}/api/payment/verify`,
                                    {
                                        method:
                                            "POST",

                                        headers: {

                                            "Content-Type":
                                                "application/json",

                                            "Authorization":
                                                `Bearer ${token}`

                                        },

                                        body:
                                            JSON.stringify({

                                                razorpay_order_id:
                                                    paymentResponse.razorpay_order_id,

                                                razorpay_payment_id:
                                                    paymentResponse.razorpay_payment_id,

                                                razorpay_signature:
                                                    paymentResponse.razorpay_signature,

                                                tourId:
                                                    selectedTour.id,

                                                travelDate:
                                                    bookingDate,

                                                travellers:
                                                    Number(
                                                        bookingTravellers
                                                    ),

                                                customerName:
                                                    bookingName.trim(),

                                                customerEmail:
                                                    bookingEmail
                                                        .trim()
                                                        .toLowerCase()

                                            })
                                    }
                                );


                            const verifyData =
                                await verifyResponse.json();


                            if (
                                !verifyResponse.ok
                            ) {

                                throw new Error(
                                    verifyData.message ||
                                    "Payment verification failed."
                                );

                            }


                            setBookingMessage(
                                "Payment successful! Your booking is confirmed."
                            );


                            setProcessingPayment(
                                false
                            );


                            setTimeout(
                                () => {

                                    setShowBooking(
                                        false
                                    );

                                    setSelectedTour(
                                        null
                                    );

                                    setBookingMessage(
                                        ""
                                    );

                                },
                                1800
                            );


                        } catch (
                            verificationError
                        ) {

                            console.error(
                                "Payment verification error:",
                                verificationError
                            );


                            setBookingMessage(
                                verificationError.message ||
                                "Payment verification failed."
                            );


                            setProcessingPayment(
                                false
                            );

                        }

                    },


                modal:
                    {

                        ondismiss:
                            function () {

                                setBookingMessage(
                                    "Payment window closed."
                                );

                                setProcessingPayment(
                                    false
                                );

                            }

                    }

            };


            /* ---------------------------------------------
               CREATE RAZORPAY CHECKOUT
            --------------------------------------------- */

            console.log(
                "Opening Razorpay with:",
                {
                    hasKey:
                        Boolean(
                            options.key
                        ),

                    orderId:
                        options.order_id,

                    amount:
                        options.amount,

                    currency:
                        options.currency
                }
            );


            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                function (
                    response
                ) {

                    console.error(
                        "Razorpay payment failed:",
                        response
                    );


                    setBookingMessage(
                        response?.error?.description ||
                        "Payment failed."
                    );


                    setProcessingPayment(
                        false
                    );

                }
            );


            razorpay.open();


        } catch (error) {

            console.error(
                "Payment error:",
                error
            );


            setBookingMessage(
                error.message ||
                "Unable to start payment."
            );


            setProcessingPayment(
                false
            );

        }

    };


    /* =====================================================
       TOTAL
    ===================================================== */

    const pricePerPerson =
        selectedTour
            ? Number(
                selectedTour.price.replace(
                    /[^0-9]/g,
                    ""
                )
            )
            : 0;


    const totalAmount =
        pricePerPerson *
        Number(bookingTravellers);


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div
            className={
                darkMode
                    ? "app dark-mode"
                    : "app"
            }
        >

            <Navbar
                darkMode={
                    darkMode
                }

                setDarkMode={
                    setDarkMode
                }

                scrollToSection={
                    scrollToSection
                }
            />


            {/* =================================================
                HERO
            ================================================= */}

            <section
                id="home"
                className="hero-section"
            >

                <div className="hero-content">

                    <span className="hero-label">
                        EXPLORE • DREAM • DISCOVER
                    </span>

                    <h1>
                        Discover More.
                        <br />
                        Travel Further.
                    </h1>

                    <p>
                        Explore beautiful destinations,
                        create unforgettable memories
                        and experience the world with Wanderly.
                    </p>


                    <form
                        className="search-box"
                        onSubmit={
                            handleSearch
                        }
                    >

                        <div className="search-item">

                            <label>
                                Destination
                            </label>

                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                value={
                                    destination
                                }
                                onChange={
                                    (e) =>
                                        setDestination(
                                            e.target.value
                                        )
                                }
                            />

                        </div>


                        <div className="search-item">

                            <label>
                                Travel Date
                            </label>

                            <input
                                type="date"
                                value={
                                    travelDate
                                }
                                onChange={
                                    (e) =>
                                        setTravelDate(
                                            e.target.value
                                        )
                                }
                            />

                        </div>


                        <div className="search-item">

                            <label>
                                Travellers
                            </label>

                            <select
                                value={
                                    travellers
                                }
                                onChange={
                                    (e) =>
                                        setTravellers(
                                            e.target.value
                                        )
                                }
                            >

                                <option value="1">
                                    1 Traveller
                                </option>

                                <option value="2">
                                    2 Travellers
                                </option>

                                <option value="3">
                                    3 Travellers
                                </option>

                                <option value="4">
                                    4 Travellers
                                </option>

                                <option value="5">
                                    5 Travellers
                                </option>

                                <option value="6">
                                    6 Travellers
                                </option>

                            </select>

                        </div>


                        <button
                            type="submit"
                            className="search-button"
                        >
                            Search
                        </button>

                    </form>


                    {searchMessage && (

                        <div className="search-message">
                            {searchMessage}
                        </div>

                    )}

                </div>

            </section>


            {/* =================================================
                DESTINATIONS
            ================================================= */}

            <section
                id="destinations"
                className="destinations-section"
            >

                <div className="section-header">

                    <span>
                        EXPLORE
                    </span>

                    <h2>
                        Popular Destinations
                    </h2>

                    <p>
                        Discover beautiful places,
                        cultures and unforgettable experiences.
                    </p>

                </div>


                <div className="destination-grid">

                    <div className="destination-card">

                        <img
                            src="/images/kerala.jpg"
                            alt="Kerala"
                        />

                        <div>

                            <small>
                                South India
                            </small>

                            <h3>
                                Kerala
                            </h3>

                            <p>
                                Experience peaceful backwaters,
                                beautiful beaches and rich traditions.
                            </p>

                            <button
                                onClick={() => {

                                    setDestination(
                                        "Kerala"
                                    );

                                    scrollToSection(
                                        "home"
                                    );

                                }}
                            >
                                Explore Destination →
                            </button>

                        </div>

                    </div>


                    <div className="destination-card">

                        <img
                            src="/images/kashmir.jpg"
                            alt="Kashmir"
                        />

                        <div>

                            <small>
                                North India
                            </small>

                            <h3>
                                Kashmir
                            </h3>

                            <p>
                                Explore breathtaking mountains,
                                valleys and unforgettable scenery.
                            </p>

                            <button
                                onClick={() => {

                                    setDestination(
                                        "Kashmir"
                                    );

                                    scrollToSection(
                                        "home"
                                    );

                                }}
                            >
                                Explore Destination →
                            </button>

                        </div>

                    </div>


                    <div className="destination-card">

                        <img
                            src="/images/goa.jpg"
                            alt="Goa"
                        />

                        <div>

                            <small>
                                West India
                            </small>

                            <h3>
                                Goa
                            </h3>

                            <p>
                                Enjoy sunny beaches,
                                coastal adventures and nightlife.
                            </p>

                            <button
                                onClick={() => {

                                    setDestination(
                                        "Goa"
                                    );

                                    scrollToSection(
                                        "home"
                                    );

                                }}
                            >
                                Explore Destination →
                            </button>

                        </div>

                    </div>


                    <div className="destination-card">

                        <img
                            src="/images/Rajasthan.jpg"
                            alt="Rajasthan"
                        />

                        <div>

                            <small>
                                West India
                            </small>

                            <h3>
                                Rajasthan
                            </h3>

                            <p>
                                Discover magnificent forts,
                                palaces and cultural traditions.
                            </p>

                            <button
                                onClick={() => {

                                    setDestination(
                                        "Rajasthan"
                                    );

                                    scrollToSection(
                                        "home"
                                    );

                                }}
                            >
                                Explore Destination →
                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                FEATURES
            ================================================= */}

            <section
                className="features-section"
            >

                <div className="section-header">

                    <span>
                        WHY WANDERLY
                    </span>

                    <h2>
                        Travel With Confidence
                    </h2>

                    <p>
                        Everything you need for a comfortable
                        and memorable journey.
                    </p>

                </div>


                <div className="feature-grid">

                    <div className="feature-card">

                        <div className="feature-icon">
                            🌍
                        </div>

                        <h3>
                            Amazing Destinations
                        </h3>

                        <p>
                            Discover incredible destinations
                            across India and beyond.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            🧭
                        </div>

                        <h3>
                            Expert Guides
                        </h3>

                        <p>
                            Travel with experienced guides
                            who know the destinations.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            💰
                        </div>

                        <h3>
                            Best Prices
                        </h3>

                        <p>
                            Find attractive travel packages
                            at competitive prices.
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                TOURS
            ================================================= */}

            <section
                id="tours"
                className="tours-section"
            >

                <div className="section-header">

                    <span>
                        POPULAR TOURS
                    </span>

                    <h2>
                        Choose Your Next Adventure
                    </h2>

                    <p>
                        Explore our hand-picked travel experiences.
                    </p>

                </div>


                <div className="tour-filters">

                    <button
                        className={
                            activeFilter === "All"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "All"
                            )
                        }
                    >
                        All
                    </button>


                    <button
                        className={
                            activeFilter === "Beach"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "Beach"
                            )
                        }
                    >
                        Beach
                    </button>


                    <button
                        className={
                            activeFilter === "Mountain"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "Mountain"
                            )
                        }
                    >
                        Mountain
                    </button>


                    <button
                        className={
                            activeFilter === "Culture"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "Culture"
                            )
                        }
                    >
                        Culture
                    </button>


                    <button
                        className={
                            activeFilter === "Adventure"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "Adventure"
                            )
                        }
                    >
                        Adventure
                    </button>

                </div>


                <div className="tour-grid">

                    {filteredTours.map(
                        (tour) => (

                            <div
                                className="tour-card"
                                key={
                                    tour.id
                                }
                            >

                                <div className="tour-image">

                                    <img
                                        src={
                                            tour.image
                                        }
                                        alt={
                                            tour.title
                                        }
                                    />

                                    <span>
                                        {
                                            tour.category
                                        }
                                    </span>

                                </div>


                                <div className="tour-content">

                                    <small>
                                        {
                                            tour.duration
                                        }
                                    </small>

                                    <h3>
                                        {
                                            tour.title
                                        }
                                    </h3>

                                    <p>
                                        {
                                            tour.description
                                        }
                                    </p>


                                    <div className="tour-bottom">

                                        <strong>
                                            {
                                                tour.price
                                            }
                                        </strong>

                                        <button
                                            onClick={() =>
                                                openBooking(
                                                    tour
                                                )
                                            }
                                        >
                                            Book Now
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                ABOUT
            ================================================= */}

            <section
                id="about"
                className="about-section"
            >

                <div className="about-container">

                    <div className="about-image">

                        <img
                            src="/images/kerala.jpg"
                            alt="Wanderly"
                        />

                    </div>


                    <div className="about-content">

                        <span>
                            ABOUT WANDERLY
                        </span>

                        <h2>
                            Your Journey.
                            <br />
                            Your Story.
                        </h2>

                        <p>
                            Wanderly helps travellers discover
                            beautiful destinations and create
                            unforgettable experiences.
                        </p>

                        <p>
                            From peaceful beaches and mountains
                            to historic cities and cultural
                            destinations, we make planning your
                            journey simple.
                        </p>

                        <button
                            onClick={() =>
                                scrollToSection(
                                    "contact"
                                )
                            }
                        >
                            Plan My Trip
                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                TESTIMONIALS
            ================================================= */}

            <section
                className="testimonials-section"
            >

                <div className="section-header">

                    <span>
                        TRAVELLER STORIES
                    </span>

                    <h2>
                        What Travellers Say
                    </h2>

                </div>


                <div className="testimonial-grid">

                    <div className="testimonial-card">

                        <div className="stars">
                            ★★★★★
                        </div>

                        <p>
                            "Wanderly made planning our Kashmir
                            trip incredibly simple. Everything
                            was well organised."
                        </p>

                        <strong>
                            — Rahul
                        </strong>

                    </div>


                    <div className="testimonial-card">

                        <div className="stars">
                            ★★★★★
                        </div>

                        <p>
                            "The Goa trip was amazing. The
                            destination recommendations were
                            exactly what we needed."
                        </p>

                        <strong>
                            — Priya
                        </strong>

                    </div>


                    <div className="testimonial-card">

                        <div className="stars">
                            ★★★★★
                        </div>

                        <p>
                            "A beautiful way to discover
                            destinations and plan our next
                            adventure."
                        </p>

                        <strong>
                            — Arjun
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                CTA
            ================================================= */}

            <section
                className="cta-section"
            >

                <div className="cta-content">

                    <span>
                        START YOUR JOURNEY
                    </span>

                    <h2>
                        Where Will You Go Next?
                    </h2>

                    <p>
                        Your next adventure is waiting.
                        Start exploring with Wanderly today.
                    </p>

                    <button
                        onClick={() =>
                            scrollToSection(
                                "tours"
                            )
                        }
                    >
                        Explore Tours
                    </button>

                </div>

            </section>


            {/* =================================================
                CONTACT
            ================================================= */}

            <section
                id="contact"
                className="contact-section"
            >

                <div className="section-header">

                    <span>
                        CONTACT US
                    </span>

                    <h2>
                        Let's Plan Your Journey
                    </h2>

                    <p>
                        Have a question? Send us a message.
                    </p>

                </div>


                <form
                    className="contact-form"
                    onSubmit={(e) => {

                        e.preventDefault();

                        alert(
                            "Thank you! Your message has been received."
                        );

                    }}
                >

                    <input
                        type="text"
                        placeholder="Your Name"
                        required
                    />

                    <input
                        type="email"
                        placeholder="Your Email"
                        required
                    />

                    <textarea
                        rows="6"
                        placeholder="Your Message"
                        required
                    />

                    <button type="submit">
                        Send Message
                    </button>

                </form>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="footer">

                <div className="footer-container">

                    <div>

                        <h2>
                            Wanderly
                        </h2>

                        <p>
                            Discover More.
                            Travel Further.
                        </p>

                    </div>


                    <div>

                        <h3>
                            Explore
                        </h3>

                        <button
                            onClick={() =>
                                scrollToSection(
                                    "home"
                                )
                            }
                        >
                            Home
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection(
                                    "destinations"
                                )
                            }
                        >
                            Destinations
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection(
                                    "tours"
                                )
                            }
                        >
                            Tours
                        </button>

                    </div>


                    <div>

                        <h3>
                            Company
                        </h3>

                        <button
                            onClick={() =>
                                scrollToSection(
                                    "about"
                                )
                            }
                        >
                            About
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection(
                                    "contact"
                                )
                            }
                        >
                            Contact
                        </button>

                    </div>

                </div>


                <div className="footer-bottom">

                    <p>
                        © 2026 Wanderly. All rights reserved.
                    </p>

                </div>

            </footer>


            {/* =================================================
                BOOKING MODAL
            ================================================= */}

            {showBooking &&
                selectedTour && (

                    <div
                        className="booking-overlay"
                        onClick={
                            closeBooking
                        }
                    >

                        <div
                            className="booking-modal"
                            onClick={
                                (e) =>
                                    e.stopPropagation()
                            }
                        >

                            <button
                                className="booking-close"
                                onClick={
                                    closeBooking
                                }
                                type="button"
                            >
                                ×
                            </button>


                            <div className="booking-header">

                                <span>
                                    BOOK YOUR TRIP
                                </span>

                                <h2>
                                    {
                                        selectedTour.title
                                    }
                                </h2>

                                <p>
                                    {
                                        selectedTour.duration
                                    }
                                </p>

                            </div>


                            <div className="booking-tour-info">

                                <img
                                    src={
                                        selectedTour.image
                                    }
                                    alt={
                                        selectedTour.title
                                    }
                                />

                                <div>

                                    <strong>
                                        {
                                            selectedTour.price
                                        }
                                    </strong>

                                    <span>
                                        per person
                                    </span>

                                </div>

                            </div>


                            <form
                                className="booking-form"
                                onSubmit={
                                    handleBooking
                                }
                            >

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        bookingName
                                    }
                                    onChange={
                                        (e) =>
                                            setBookingName(
                                                e.target.value
                                            )
                                    }
                                    readOnly
                                    required
                                />


                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={
                                        bookingEmail
                                    }
                                    onChange={
                                        (e) =>
                                            setBookingEmail(
                                                e.target.value
                                            )
                                    }
                                    readOnly
                                    required
                                />


                                <label>
                                    Travel Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        bookingDate
                                    }
                                    onChange={
                                        (e) =>
                                            setBookingDate(
                                                e.target.value
                                            )
                                    }
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split(
                                                "T"
                                            )[0]
                                    }
                                    required
                                />


                                <label>
                                    Number of Travellers
                                </label>

                                <select
                                    value={
                                        bookingTravellers
                                    }
                                    onChange={
                                        (e) =>
                                            setBookingTravellers(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="1">
                                        1 Traveller
                                    </option>

                                    <option value="2">
                                        2 Travellers
                                    </option>

                                    <option value="3">
                                        3 Travellers
                                    </option>

                                    <option value="4">
                                        4 Travellers
                                    </option>

                                    <option value="5">
                                        5 Travellers
                                    </option>

                                    <option value="6">
                                        6 Travellers
                                    </option>

                                </select>


                                <div className="booking-total">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        ₹
                                        {
                                            totalAmount.toLocaleString(
                                                "en-IN"
                                            )
                                        }
                                    </strong>

                                </div>


                                <button
                                    type="submit"
                                    className="confirm-booking-button"
                                    disabled={
                                        processingPayment
                                    }
                                >

                                    {processingPayment
                                        ? "Processing..."
                                        : "Pay & Confirm Booking"}

                                </button>


                                {bookingMessage && (

                                    <div
                                        className="booking-message"
                                    >
                                        {
                                            bookingMessage
                                        }
                                    </div>

                                )}

                            </form>

                        </div>

                    </div>

                )}

        </div>

    );

}


export default App;