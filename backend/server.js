require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const User = require("./models/User");
const Admin = require("./models/Admin");
const BookingSchema = require("./models/Booking");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
    process.env.JWT_SECRET || "wanderly-secret-key";



/* =========================================================
   DATABASE CONNECTIONS
========================================================= */

const userConnection = mongoose.createConnection(
    process.env.MONGO_URI
);

const bookingConnection = mongoose.createConnection(
    process.env.MONGO_BOOKINGS_URI
);



/* =========================================================
   DATABASE MODELS
========================================================= */

const UserModel = userConnection.model(
    "User",
    User.schema
);

const AdminModel = userConnection.model(
    "Admin",
    Admin.schema
);

const BookingModel = bookingConnection.model(
    "Booking",
    BookingSchema
);



/* =========================================================
   RAZORPAY
========================================================= */

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});



/* =========================================================
   TOUR DATA
   IMPORTANT:
   Prices are stored on the backend so customers
   cannot change the price from the browser.
========================================================= */

const tours = {
    1: {
        name: "Goa Beach Escape",
        price: 14999
    },

    2: {
        name: "Kashmir Mountain Journey",
        price: 24999
    },

    3: {
        name: "Rajasthan Heritage Tour",
        price: 19999
    },

    4: {
        name: "Kerala Nature Escape",
        price: 18999
    }
};



/* =========================================================
   USER TOKEN VERIFICATION
========================================================= */

function verifyUserToken(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            message: "Login required."
        });

    }

    const token =
        authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

    try {

        const decoded =
            jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "user") {

            return res.status(403).json({
                message: "User access required."
            });

        }

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired login."
        });

    }
}



/* =========================================================
   ADMIN TOKEN VERIFICATION
========================================================= */

function verifyAdminToken(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            message: "Admin login required."
        });

    }

    const token =
        authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

    try {

        const decoded =
            jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {

            return res.status(403).json({
                message: "Admin access required."
            });

        }

        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired admin login."
        });

    }
}



/* =========================================================
   BASIC ROUTES
========================================================= */

app.get("/", (req, res) => {

    res.json({
        message: "Wanderly backend is running."
    });

});


app.get("/api/test", (req, res) => {

    res.json({
        message: "Wanderly API is working."
    });

});



/* =========================================================
   REGISTER
========================================================= */

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Name, email and password are required."
            });

        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await UserModel.findOne({
                email: normalizedEmail
            });

        if (existingUser) {

            return res.status(400).json({
                message:
                    "An account with this email already exists."
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user =
            await UserModel.create({

                name: name.trim(),

                email: normalizedEmail,

                password: hashedPassword

            });

        const token =
            jwt.sign(
                {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: "user"
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.status(201).json({

            message: "Registration successful.",

            token,

            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }

        });

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        res.status(500).json({
            message: "Registration failed."
        });

    }

});



/* =========================================================
   USER LOGIN
========================================================= */

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required."
            });

        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await UserModel.findOne({
                email: normalizedEmail
            });

        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        const token =
            jwt.sign(
                {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: "user"
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.json({

            message: "Login successful.",

            token,

            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message: "Login failed."
        });

    }

});



/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

app.post(
    "/api/payment/order",
    verifyUserToken,
    async (req, res) => {

        try {

            const {
                tourId,
                travellers,
                travelDate
            } = req.body;

            const tour =
                tours[Number(tourId)];

            if (!tour) {

                return res.status(400).json({
                    message:
                        "Invalid tour selected."
                });

            }

            const numberOfTravellers =
                Number(travellers);

            if (
                !Number.isInteger(
                    numberOfTravellers
                ) ||
                numberOfTravellers < 1 ||
                numberOfTravellers > 6
            ) {

                return res.status(400).json({
                    message:
                        "Invalid number of travellers."
                });

            }

            if (!travelDate) {

                return res.status(400).json({
                    message:
                        "Travel date is required."
                });

            }

            const totalAmount =
                tour.price *
                numberOfTravellers;

            /*
                Razorpay expects the amount
                in the smallest currency unit.

                ₹14,999 becomes:
                14999 × 100 = 1499900 paise
            */

            const amountInPaise =
                totalAmount * 100;

            const order =
                await razorpay.orders.create({

                    amount:
                        amountInPaise,

                    currency: "INR",

                    receipt:
                        `wanderly_${Date.now()}`,

                    notes: {

                        tourId:
                            String(tourId),

                        tourName:
                            tour.name,

                        travellers:
                            String(
                                numberOfTravellers
                            ),

                        travelDate:
                            travelDate,

                        userId:
                            String(
                                req.user.id
                            ),

                        customerEmail:
                            req.user.email

                    }

                });

            res.json({

                success: true,

                key:
                    process.env
                        .RAZORPAY_KEY_ID,

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                tourName:
                    tour.name,

                totalAmount:
                    totalAmount

            });

        } catch (error) {

            console.error(
                "Razorpay order error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to create payment order."
            });

        }

    }
);



/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

app.post(
    "/api/payment/verify",
    verifyUserToken,
    async (req, res) => {

        try {

            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                tourId,
                travelDate,
                travellers
            } = req.body;

            if (
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {

                return res.status(400).json({
                    message:
                        "Payment information is incomplete."
                });

            }

            /*
                Retrieve the Razorpay order from Razorpay.

                This prevents the browser from changing
                the original order amount.
            */

            const order =
                await razorpay.orders.fetch(
                    razorpay_order_id
                );

            if (!order) {

                return res.status(400).json({
                    message:
                        "Razorpay order not found."
                });

            }

            /*
                Check that this order belongs
                to the logged-in user.
            */

            if (
                order.notes.userId !==
                String(req.user.id)
            ) {

                return res.status(403).json({
                    message:
                        "This payment does not belong to this user."
                });

            }

            const tour =
                tours[Number(tourId)];

            if (!tour) {

                return res.status(400).json({
                    message:
                        "Invalid tour."
                });

            }

            const numberOfTravellers =
                Number(travellers);

            const expectedAmount =
                tour.price *
                numberOfTravellers *
                100;

            if (
                Number(order.amount) !==
                Number(expectedAmount)
            ) {

                return res.status(400).json({
                    message:
                        "Payment amount does not match booking."
                });

            }

            /*
                Create HMAC SHA256 signature.

                Razorpay signature:
                HMAC(order_id + "|" + payment_id)
            */

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env
                            .RAZORPAY_KEY_SECRET
                    )
                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )
                    .digest("hex");

            const signatureIsValid =
                crypto.timingSafeEqual(
                    Buffer.from(
                        generatedSignature
                    ),
                    Buffer.from(
                        razorpay_signature
                    )
                );

            if (!signatureIsValid) {

                return res.status(400).json({
                    message:
                        "Payment verification failed."
                });

            }

            /*
                Save booking only AFTER
                successful payment verification.
            */

            const booking =
                await BookingModel.create({

                    userId:
                        String(req.user.id),

                    tourId:
                        Number(tourId),

                    tourName:
                        tour.name,

                    customerName:
                        req.user.name,

                    customerEmail:
                        req.user.email,

                    travelDate:
                        travelDate,

                    travellers:
                        numberOfTravellers,

                    pricePerPerson:
                        tour.price,

                    totalAmount:
                        tour.price *
                        numberOfTravellers,

                    razorpayOrderId:
                        razorpay_order_id,

                    razorpayPaymentId:
                        razorpay_payment_id,

                    razorpaySignature:
                        razorpay_signature,

                    paymentStatus:
                        "Paid",

                    bookingStatus:
                        "Confirmed"

                });

            res.json({

                success: true,

                message:
                    "Payment verified and booking confirmed.",

                booking: {

                    id:
                        booking._id,

                    tourName:
                        booking.tourName,

                    totalAmount:
                        booking.totalAmount,

                    paymentStatus:
                        booking.paymentStatus,

                    bookingStatus:
                        booking.bookingStatus

                }

            });

        } catch (error) {

            console.error(
                "Payment verification error:",
                error
            );

            res.status(500).json({
                message:
                    "Payment verification failed."
            });

        }

    }
);



/* =========================================================
   MY BOOKINGS
========================================================= */

app.get(
    "/api/my-bookings",
    verifyUserToken,
    async (req, res) => {

        try {

            const bookings =
                await BookingModel.find({

                    userId:
                        String(req.user.id)

                })
                    .sort({
                        createdAt: -1
                    });

            res.json(bookings);

        } catch (error) {

            console.error(
                "My bookings error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to fetch bookings."
            });

        }

    }
);



/* =========================================================
   ADMIN - GET ALL BOOKINGS
========================================================= */

app.get(
    "/api/bookings",
    verifyAdminToken,
    async (req, res) => {

        try {

            const bookings =
                await BookingModel.find({})
                    .sort({
                        createdAt: -1
                    });

            res.json(bookings);

        } catch (error) {

            console.error(
                "Admin bookings error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to fetch bookings."
            });

        }

    }
);



/* =========================================================
   ADMIN CREATE
========================================================= */

app.post(
    "/api/admin/create",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Name, email and password are required."
                });

            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const existingAdmin =
                await AdminModel.findOne({
                    email: normalizedEmail
                });

            if (existingAdmin) {

                return res.status(400).json({
                    message:
                        "Admin already exists."
                });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const admin =
                await AdminModel.create({

                    name:
                        name.trim(),

                    email:
                        normalizedEmail,

                    password:
                        hashedPassword

                });

            res.status(201).json({

                message:
                    "Admin created successfully.",

                admin: {

                    id:
                        admin._id,

                    name:
                        admin.name,

                    email:
                        admin.email

                }

            });

        } catch (error) {

            console.error(
                "Admin creation error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to create admin."
            });

        }

    }
);



/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post(
    "/api/admin/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;

            if (
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Email and password are required."
                });

            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const admin =
                await AdminModel.findOne({
                    email:
                        normalizedEmail
                });

            if (!admin) {

                return res.status(401).json({
                    message:
                        "Invalid admin credentials."
                });

            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    admin.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        "Invalid admin credentials."
                });

            }

            const token =
                jwt.sign(
                    {
                        id:
                            admin._id.toString(),

                        name:
                            admin.name,

                        email:
                            admin.email,

                        role:
                            "admin"
                    },
                    JWT_SECRET,
                    {
                        expiresIn:
                            "7d"
                    }
                );

            res.json({

                message:
                    "Admin login successful.",

                token,

                admin: {

                    id:
                        admin._id.toString(),

                    name:
                        admin.name,

                    email:
                        admin.email

                }

            });

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            res.status(500).json({
                message:
                    "Admin login failed."
            });

        }

    }
);



/* =========================================================
   START SERVER
========================================================= */

Promise.all([
    userConnection.asPromise(),
    bookingConnection.asPromise()
])
    .then(() => {

        console.log(
            "MongoDB connections established."
        );

        app.listen(
            PORT,
            () => {

                console.log(
                    `Wanderly backend running on http://localhost:${PORT}`
                );

            }
        );

    })
    .catch((error) => {

        console.error(
            "MongoDB connection error:",
            error
        );

    });