const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require("crypto");

dotenv.config();

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());

/* =========================================================
   CONFIGURATION
========================================================= */

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;
const MONGO_BOOKINGS_URI =
    process.env.MONGO_BOOKINGS_URI;

const JWT_SECRET = process.env.JWT_SECRET;

const RAZORPAY_KEY_ID =
    process.env.RAZORPAY_KEY_ID;

const RAZORPAY_KEY_SECRET =
    process.env.RAZORPAY_KEY_SECRET;


/* =========================================================
   CHECK ENVIRONMENT VARIABLES
========================================================= */

console.log("Environment check:");

console.log(
    "MONGO_URI:",
    MONGO_URI ? "OK" : "MISSING"
);

console.log(
    "MONGO_BOOKINGS_URI:",
    MONGO_BOOKINGS_URI ? "OK" : "MISSING"
);

console.log(
    "JWT_SECRET:",
    JWT_SECRET ? "OK" : "MISSING"
);

console.log(
    "RAZORPAY_KEY_ID:",
    RAZORPAY_KEY_ID ? "OK" : "MISSING"
);

console.log(
    "RAZORPAY_KEY_SECRET:",
    RAZORPAY_KEY_SECRET ? "OK" : "MISSING"
);


/* =========================================================
   STOP SERVER IF CRITICAL VARIABLES ARE MISSING
========================================================= */

if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI is missing.");
}

if (!MONGO_BOOKINGS_URI) {
    console.error(
        "ERROR: MONGO_BOOKINGS_URI is missing."
    );
}

if (!JWT_SECRET) {
    console.error(
        "ERROR: JWT_SECRET is missing."
    );
}

if (!RAZORPAY_KEY_ID) {
    console.error(
        "ERROR: RAZORPAY_KEY_ID is missing."
    );
}

if (!RAZORPAY_KEY_SECRET) {
    console.error(
        "ERROR: RAZORPAY_KEY_SECRET is missing."
    );
}


/* =========================================================
   MONGODB CONNECTIONS
========================================================= */

const userConnection =
    mongoose.createConnection(MONGO_URI);

const bookingConnection =
    mongoose.createConnection(
        MONGO_BOOKINGS_URI
    );


/* =========================================================
   SCHEMAS
========================================================= */

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);


const bookingSchema =
    new mongoose.Schema(
        {
            userId: {
                type: String,
                required: true
            },

            tourId: {
                type: Number,
                required: true
            },

            tourName: {
                type: String,
                required: true,
                trim: true
            },

            customerName: {
                type: String,
                required: true,
                trim: true
            },

            customerEmail: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },

            travelDate: {
                type: String,
                required: true
            },

            travellers: {
                type: Number,
                required: true,
                min: 1
            },

            pricePerPerson: {
                type: Number,
                required: true
            },

            totalAmount: {
                type: Number,
                required: true
            },

            razorpayOrderId: {
                type: String,
                required: true
            },

            razorpayPaymentId: {
                type: String,
                required: true
            },

            razorpaySignature: {
                type: String,
                required: true
            },

            paymentStatus: {
                type: String,
                default: "Paid"
            },

            bookingStatus: {
                type: String,
                default: "Confirmed"
            }
        },
        {
            timestamps: true
        }
    );


const adminSchema =
    new mongoose.Schema(
        {
            name: {
                type: String,
                required: true,
                trim: true
            },

            email: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                lowercase: true
            },

            password: {
                type: String,
                required: true
            }
        },
        {
            timestamps: true
        }
    );


/* =========================================================
   MODELS
========================================================= */

const UserModel =
    userConnection.model(
        "User",
        userSchema
    );

const AdminModel =
    userConnection.model(
        "Admin",
        adminSchema
    );

const BookingModel =
    bookingConnection.model(
        "Booking",
        bookingSchema
    );


/* =========================================================
   RAZORPAY
========================================================= */

const razorpay =
    new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET
    });


/* =========================================================
   TOUR DATA
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

function verifyUserToken(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({
                message:
                    "Authentication required."
            });

        }

        const token =
            authHeader.split(" ")[1];

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        if (
            decoded.role &&
            decoded.role !== "user"
        ) {

            return res.status(403).json({
                message:
                    "User access required."
            });

        }

        req.user = decoded;

        next();

    } catch (error) {

        console.error(
            "User token verification error:",
            error.message
        );

        return res.status(401).json({
            message:
                "Invalid or expired authentication token."
        });

    }

}


/* =========================================================
   ADMIN TOKEN VERIFICATION
========================================================= */

function verifyAdminToken(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({
                message:
                    "Admin authentication required."
            });

        }

        const token =
            authHeader.split(" ")[1];

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        if (
            decoded.role !== "admin"
        ) {

            return res.status(403).json({
                message:
                    "Admin access required."
            });

        }

        req.admin = decoded;

        next();

    } catch (error) {

        console.error(
            "Admin token verification error:",
            error.message
        );

        return res.status(401).json({
            message:
                "Invalid or expired admin token."
        });

    }

}


/* =========================================================
   HOME
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.json({
            message:
                "Wanderly backend is running."
        });

    }
);


/* =========================================================
   TEST
========================================================= */

app.get(
    "/api/test",
    (req, res) => {

        res.json({
            success: true,
            message:
                "Wanderly API is working."
        });

    }
);


/* =========================================================
   REGISTER
========================================================= */

app.post(
    "/api/register",
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

            if (
                password.length < 6
            ) {

                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters."
                });

            }

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            const existingUser =
                await UserModel.findOne({
                    email:
                        normalizedEmail
                });

            if (existingUser) {

                return res.status(409).json({
                    message:
                        "An account with this email already exists."
                });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const user =
                await UserModel.create({
                    name:
                        name.trim(),

                    email:
                        normalizedEmail,

                    password:
                        hashedPassword
                });

            res.status(201).json({
                success: true,

                message:
                    "Registration successful.",

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            res.status(500).json({
                message:
                    "Registration failed."
            });

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

app.post(
    "/api/login",
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
                email
                    .trim()
                    .toLowerCase();

            const user =
                await UserModel.findOne({
                    email:
                        normalizedEmail
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
                        userId:
                            user._id.toString(),

                        name:
                            user.name,

                        email:
                            user.email,

                        role:
                            "user"
                    },
                    JWT_SECRET,
                    {
                        expiresIn:
                            "7d"
                    }
                );

            res.json({

                success: true,

                token,

                user: {
                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email
                }

            });

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            res.status(500).json({
                message:
                    "Login failed."
            });

        }

    }
);


/* =========================================================
   CREATE RAZORPAY PAYMENT ORDER
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


            console.log(
                "Payment order request:",
                {
                    userId:
                        req.user.userId,

                    tourId,

                    travellers,

                    travelDate
                }
            );


            if (
                !tourId ||
                !travellers ||
                !travelDate
            ) {

                return res.status(400).json({
                    message:
                        "Tour, travellers and travel date are required."
                });

            }


            const numericTourId =
                Number(tourId);

            const numberOfTravellers =
                Number(travellers);


            const tour =
                tours[numericTourId];


            if (!tour) {

                return res.status(400).json({
                    message:
                        "Invalid tour selected."
                });

            }


            if (
                !Number.isInteger(
                    numberOfTravellers
                ) ||
                numberOfTravellers < 1 ||
                numberOfTravellers > 20
            ) {

                return res.status(400).json({
                    message:
                        "Invalid number of travellers."
                });

            }


            if (
                !RAZORPAY_KEY_ID ||
                !RAZORPAY_KEY_SECRET
            ) {

                console.error(
                    "Razorpay credentials are missing on the server."
                );

                return res.status(500).json({
                    message:
                        "Razorpay is not configured on the server."
                });

            }


            const totalAmount =
                tour.price *
                numberOfTravellers;


            const order =
                await razorpay.orders.create({

                    amount:
                        totalAmount * 100,

                    currency:
                        "INR",

                    receipt:
                        `wanderly_${Date.now()}`,

                    notes: {

                        userId:
                            req.user.userId,

                        tourId:
                            String(
                                numericTourId
                            ),

                        travellers:
                            String(
                                numberOfTravellers
                            ),

                        travelDate:
                            travelDate
                    }

                });


            console.log(
                "Razorpay order created:",
                order.id
            );


            /*
             IMPORTANT:

             The frontend will use "keyId".

             We deliberately return the public
             Razorpay Key ID here.

             The secret is NEVER returned.
            */

            return res.json({

                success: true,

                keyId:
                    RAZORPAY_KEY_ID,

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                tourId:
                    numericTourId,

                tourName:
                    tour.name,

                pricePerPerson:
                    tour.price,

                travellers:
                    numberOfTravellers,

                totalAmount:
                    totalAmount

            });

        } catch (error) {

            console.error(
                "Razorpay order creation error:",
                error
            );

            return res.status(500).json({

                message:
                    error?.error?.description ||
                    error?.message ||
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
                travellers,
                customerName,
                customerEmail
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


            if (
                order.notes?.userId !==
                req.user.userId
            ) {

                return res.status(403).json({
                    message:
                        "This payment order does not belong to the logged-in user."
                });

            }


            const numericTourId =
                Number(tourId);

            const numberOfTravellers =
                Number(travellers);

            const tour =
                tours[numericTourId];


            if (!tour) {

                return res.status(400).json({
                    message:
                        "Invalid tour."
                });

            }


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
                        "Payment amount verification failed."
                });

            }


            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        RAZORPAY_KEY_SECRET
                    )
                    .update(
                        `${razorpay_order_id}|${razorpay_payment_id}`
                    )
                    .digest("hex");


            if (
                generatedSignature !==
                razorpay_signature
            ) {

                return res.status(400).json({
                    message:
                        "Payment signature verification failed."
                });

            }


            const booking =
                await BookingModel.create({

                    userId:
                        req.user.userId,

                    tourId:
                        numericTourId,

                    tourName:
                        tour.name,

                    customerName:
                        customerName ||
                        req.user.name,

                    customerEmail:
                        (
                            customerEmail ||
                            req.user.email
                        )
                            .trim()
                            .toLowerCase(),

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


            console.log(
                "Booking saved:",
                booking._id.toString()
            );


            return res.json({

                success: true,

                message:
                    "Payment verified and booking confirmed.",

                booking: {
                    id:
                        booking._id,

                    tourName:
                        booking.tourName,

                    travelDate:
                        booking.travelDate,

                    travellers:
                        booking.travellers,

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

            return res.status(500).json({
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
                await BookingModel
                    .find({
                        userId:
                            req.user.userId
                    })
                    .sort({
                        createdAt:
                            -1
                    });

            res.json({

                success: true,

                bookings

            });

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
                email
                    .trim()
                    .toLowerCase();

            const existing =
                await AdminModel.findOne({
                    email:
                        normalizedEmail
                });

            if (existing) {

                return res.status(409).json({
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

                success: true,

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

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

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
                        adminId:
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

                success: true,

                token,

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
   GET ALL BOOKINGS FOR ADMIN
========================================================= */

app.get(
    "/api/bookings",
    verifyAdminToken,
    async (req, res) => {

        try {

            const bookings =
                await BookingModel
                    .find()
                    .sort({
                        createdAt:
                            -1
                    });

            res.json({

                success: true,

                bookings

            });

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
   MONGODB EVENTS
========================================================= */

userConnection.on(
    "connected",
    () => {

        console.log(
            "User MongoDB connection established."
        );

    }
);

userConnection.on(
    "error",
    (error) => {

        console.error(
            "User MongoDB error:",
            error
        );

    }
);


bookingConnection.on(
    "connected",
    () => {

        console.log(
            "Booking MongoDB connection established."
        );

    }
);

bookingConnection.on(
    "error",
    (error) => {

        console.error(
            "Booking MongoDB error:",
            error
        );

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Wanderly backend running on port ${PORT}`
        );

    }
);