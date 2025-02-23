const express = require("express");
const axios = require("axios");
const cors = require("cors");
const promBundle = require("express-prom-bundle");
const YAML = require('yaml');
const fs = require("fs");
const app = express();
const port = 8000;

const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:8001";

app.use(cors());
app.use(express.json());

app.set("json spaces", 40);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

let returnError = (res, error) => {
  console.log(error);
  res.status(error.response.status).json({ error: error.response.data.error });
}

app.post("/login", async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(userServiceUrl + "/login", req.body);
    res.json(authResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.post("/adduser", async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(
      userServiceUrl + "/adduser",
      req.body
    );
    res.json(userResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server;