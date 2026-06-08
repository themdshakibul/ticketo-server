const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");
dotenv.config();

const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

const app = express();
app.use(cors());
app.use(express.json());

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const db = client.db("TicketoDB");
    const organizationCallection = db.collections("organizations");
    const eventsCallection = db.collections("events");
    const bookingCallection = db.collections("bookings");
    const paymentCallection = db.collections("payments");

    // await client.connect();
    // await client.db("admin").command({ ping: 1 });

    app.post("/api/organizations", async (req, res) => {
      const { organizationName, logo, website, description, organizerEmail } =
        req.body;

      const addData = {
        organizationName,
        logo,
        website,
        description,
        organizerEmail,
        createdAt: new Date(),
        status,
      };

      const result = await organizationCallection.insertOne(addData);
      return result;
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Wellcome ticketo-server!");
});

app.listen(port, () => {
  console.log(`Ticketo app listening on port ${port}`);
});
