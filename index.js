require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");
const express = require("express");
const app = express();

app.use(bodyParser.json());

app.use(
  basicAuth({
    challenge: true,
    users: {
      [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD,
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static/index.html"));
});

app.post("/upload", (req, res) => {
  console.log(req.body);
  res.status(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listeneing on port: ${process.env.PORT || 3000}`);
});
