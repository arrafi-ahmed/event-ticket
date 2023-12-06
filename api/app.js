require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
process.env.TZ = "UTC";
const express = require("express");
const app = express();
const path = require("path");
const userAgent = require("./src/middleware/userAgent");
const customCors = require("./src/middleware/customCors");
const {
  globalErrHandler,
  uncaughtErrHandler,
} = require("./src/middleware/errHandler");
const port = process.env.PORT || 3000;

//middlewares
app.use(userAgent);
app.use(customCors);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const server = app.listen(port, (err) => {
  if (err) return console.error(err);
  console.log(`Server started at ${port}`);
});
uncaughtErrHandler();

//routes
app.use("/api/user", require("./src/controller/user"));
app.use("/api/event", require("./src/controller/event"));
app.use("/api/registrationForm", require("./src/controller/registrationForm"));
app.use("/api/badgeDesign", require("./src/controller/badgeDesign"));
app.use("/api/ticket", require("./src/controller/ticket"));
app.use("/api/purchase", require("./src/controller/purchase"));
app.use("/api/users", require("./src/controller/users"));

app.get("/api/version", (req, res) => {
  res.status(200).json({ version: 1.0 });
});

app.use(globalErrHandler);

//for dev purpose only, fix nodemon bug EADDRINUSE
process.once("SIGUSR2", function () {
  process.kill(process.pid, "SIGUSR2");
});
