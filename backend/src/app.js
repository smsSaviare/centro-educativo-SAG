const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.json({ message: "¡Bienvenido a la API del Centro Educativo SAG!" }));

module.exports = app;
