const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT;
const url = process.env.MONGO_URI;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Wellcome ticketo-server!");
});

app.listen(port, () => {
  console.log(`Ticketo app listening on port ${port}`);
});
