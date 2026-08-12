const express = require("express");
require("dotenv").config();
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const db = require("./config/db");
require("./config/firebaseAdmin");
const { initSocket } = require("./services/socketService");
const initAutoRejectCron = require("./services/autoRejectService");

// Routes
const route = require("./routes/authRouter");
const addressRouter = require("./routes/addressRouter");
const userRouter = require("./routes/userRouter");
const donorRoutes = require("./routes/donorRoutes");
const seekerRouter = require("./routes/seekerRouter");
const historyRouter = require("./routes/historyRouter");
const googleSignup = require("./routes/googleSignup");
const formRoutes = require("./routes/formRouter");

require("./config/passport");

const app = express();
const server = http.createServer(app);

const io = initSocket(server);
app.set("io", io);

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_URL_WEB,
  process.env.FRONTEND_URL_MOBILE,
  process.env.BACKEND_SERVER,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(passport.initialize());

app.use("/health", (req, res) => {
  res.status(200).json({ message: "Health check passed!" });
});

initAutoRejectCron();

app.use("/auth", route);
app.use("/api/addresses", addressRouter);
app.use("/api/user", userRouter);
app.use("/api/donors", donorRoutes);
app.use("/api/seeker", seekerRouter);
app.use("/api", historyRouter);
app.use("/api/notifications", donorRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/auth", googleSignup);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
