const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on("connected", () => console.log("MongoDB Connected Successfully!"));
db.on("disconnected", () => console.log("MongoDB Disconnected!"));
db.on("error", (err) => console.log("MongoDB connection error!"));

module.exports = db;
