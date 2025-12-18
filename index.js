require("dotenv").config();
const express = require("express");
const cors = require("cors");
const gameRouter = require("./routes/game");
const tryRouter = require("./routes/try");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/games", gameRouter);
app.use("/try", tryRouter);

const port = process.env.SERVER_PORT || 3000;
app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log("Server listening on port", port);
});
