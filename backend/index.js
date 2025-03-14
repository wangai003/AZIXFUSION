require("dotenv").config()
const express=require('express')
const cors=require('cors')
const morgan=require("morgan")
const cookieParser=require("cookie-parser")
const authRoutes=require("./routes/Auth")
const productRoutes=require("./routes/Product")
const orderRoutes=require("./routes/Order")
const cartRoutes=require("./routes/Cart")
const brandRoutes=require("./routes/Brand")
const categoryRoutes=require("./routes/Category")
const userRoutes=require("./routes/User")
const addressRoutes=require('./routes/Address')
const reviewRoutes=require("./routes/Review")
const wishlistRoutes=require("./routes/Wishlist")
const paymentRoutes = require("./routes/Payment"); // New payment routes
const { connectToDB } = require("./database/db")
const StellarSdk = require('@stellar/stellar-sdk');
//import lipaNaMpesaRoutes from "./routes/routes.lipanampesa.js"
const lipaNaMpesaRoutes = require("./routes/routes.lipanampesa")

// server init
const server=express()

// database connection
connectToDB()

// middlewares
server.use(cors({ origin: process.env.ORIGIN, credentials: true, exposedHeaders: ['X-Total-Count'], methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
server.use(express.json());
server.use(cookieParser());
server.use(morgan("tiny"));

// routeMiddleware
server.use("/auth", authRoutes);
server.use("/users", userRoutes);
server.use("/products", productRoutes);
server.use("/orders", orderRoutes);
server.use("/cart", cartRoutes);
server.use("/brands", brandRoutes);
server.use("/categories", categoryRoutes);
server.use("/address", addressRoutes);
server.use("/reviews", reviewRoutes);
server.use("/wishlist", wishlistRoutes);
server.use("/payments", paymentRoutes); 
server.use('/api',lipaNaMpesaRoutes)// Add payment routes

server.get("/", (req, res) => {
    res.status(200).json({ message: 'running' });
});

server.post("/verify-payment", async (req, res) => {
    try {
        const { signed_envelope_xdr, amountExpected } = req.body;
        if (!signed_envelope_xdr) return res.status(400).json({ error: "Missing transaction data" });

        // Submit the transaction to Stellar Testnet
        const transaction = new StellarSdk.Transaction(signed_envelope_xdr, StellarSdk.Networks.TESTNET);
        const result = await server.submitTransaction(transaction);

        // Extract transaction details
        const { operations } = transaction;

        // Validate the transaction
        const paymentOp = operations.find(op => op.type === "payment");
        if (!paymentOp) return res.status(400).json({ error: "Invalid transaction type" });

        if (paymentOp.destination !== "YOUR_STELLAR_TESTNET_WALLET") {
            return res.status(400).json({ error: "Incorrect destination" });
        }

        if (parseFloat(paymentOp.amount) < amountExpected) {
            return res.status(400).json({ error: "Insufficient payment amount" });
        }

        res.json({ success: true, txHash: result.hash, message: "Payment verified!" });

    } catch (error) {
        console.error("Transaction failed:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
});

server.listen(8000, () => {
    console.log('server [STARTED] ~ http://localhost:8000');
});