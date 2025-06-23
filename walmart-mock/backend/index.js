const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const chatRouter = require("./routes/chat");
app.use("/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
const profileRouter = require("./routes/profile");
app.use("/profile", profileRouter);
