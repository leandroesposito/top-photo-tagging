require("dotenv").config();
const express = require("express");
const gameRouter = require("./routes/game");
const cors = require("cors");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/games", gameRouter);

const port = process.env.SERVER_PORT || 3000;
app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log("Server listening on port", port);
});
