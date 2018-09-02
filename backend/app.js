const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoutes = require("./route/user");
const contactRoutes = require("./route/contact");
const app = express();

// ESTABLISHING DATABASE CONNECTIONS

mongoose
  .connect(
    "mongodb+srv://jeffin_george_2018:"
    + process.env.MONGO_ATLAS_PW +
    "@o2services-hkajt.mongodb.net/full-contact"
    , { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/", express.static(path.join(__dirname, "angular")));

// IF BACKEND AND FRONTEND ARE HOSTED SEPERATELY

 app.use((req, res, next) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader(
     "Access-Control-Allow-Headers",
     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
   );
   res.setHeader(
     "Access-Control-Allow-Methods",
     "GET, POST, PATCH, PUT, DELETE, OPTIONS"
   );
   next();
});

app.use("/auth/api/user", userRoutes);
app.use("/auth/api/contact", contactRoutes);
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
});

module.exports = app;