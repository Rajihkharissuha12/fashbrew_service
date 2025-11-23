const express = require("express");
const cors = require("cors");

const productRouter = require("./routes/product.routes");
const userRouter = require("./routes/user.routes");
const influencerRouter = require("./routes/influencer.routes");
const ootdRoutes = require("./routes/ootd.routes");

const { errorHandler } = require("./middlewares/error");

const app = express();

const allowedOrigins = [
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.BACKEND_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow tools like curl/Postman (origin undefined)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(
        (allowedOrigin) =>
          origin === allowedOrigin ||
          (allowedOrigin.includes("*") &&
            new RegExp("^" + allowedOrigin.replace(/\*/g, ".*") + "$").test(
              origin
            ))
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If needed to send cookies/credentials
  })
);

app.use(express.json());

// routes
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/influencers", influencerRouter);
app.use("/api/ootds", ootdRoutes);

// error handler harus paling akhir
app.use(errorHandler);

module.exports = app;
