require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const captiveRoutes = require("./src/routes/captiveRoutes");
const { notFoundHandler } = require("./src/middlewares/notFound");
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable("x-powered-by");
app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origem nao autorizada pelo CORS."));
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"]
    })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API online.",
        data: {
            app: process.env.APP_NAME || "Wifi Captive Portal",
            uptime: process.uptime()
        }
    });
});

app.use("/api/captive", captiveRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`API executando na porta ${port}`);
});
