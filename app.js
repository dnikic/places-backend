const fs = require("fs");
const path = require("path");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //Can be localhost:3000 for our react app
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

app.use("/api/places", placesRoutes); // api/places
app.use("/api/users", usersRoutes); // api/users

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred." });
});

mongoose
  // .connect("mongodb://localhost:27017/mern")
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@merncluster.z4qsufa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=MernCluster`
  )
  .then(() => app.listen(5500))
  .catch((err) => console.log(err));
