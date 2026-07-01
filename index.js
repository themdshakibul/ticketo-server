const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const organizationCallection = db.collection("organizations");
    const eventsCallection = db.collection("events");
    const userCallection = db.collection("user");
    const bookingCallection = db.collection("bookings");
    const paymentCallection = db.collection("payments");

    // organizations api
    app.get("/api/organizations/:email", async (req, res) => {
      const { email } = req.params;
      const result = await organizationCallection.findOne({
        organizerEmail: email,
      });
      res.json(result);
    });

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
        status: "active",
      };

      const result = await organizationCallection.insertOne(addData);
      res.json(result);
    });

    app.patch("/api/organizations/:id", async (req, res) => {
      const { id } = req.params;
      const { organizationName, logo, website, description, organizerEmail } =
        req.body;

      const updateData = {
        organizationName,
        logo,
        website,
        description,
        organizerEmail,
      };

      const result = await organizationCallection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...updateData,
          },
        },
      );
      res.json(result);
    });

    // events releted api
    app.get("/api/events", async (req, res) => {
      const search = req.query.search;
      const category = req.query.category;
      const location = req.query.location;

      const query = {};

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (category) {
        query.category = { $in: category.split(",") };
      }

      if (location) {
        query.location = location;
      }

      const result = await eventsCallection.find(query).toArray();
      res.json(result);
    });

    app.get("/api/single-events/:id", async (req, res) => {
      const { id } = req.params;
      const result = await eventsCallection.findOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    app.get("/api/events/:email", async (req, res) => {
      const { email } = req.params;
      const result = await eventsCallection
        .find({
          organizationEmail: email,
        })
        .toArray();
      res.json(result);
    });

    app.post("/api/events", async (req, res) => {
      const data = req.body;
      const organizer = await userCallection.findOne({
        email: data?.organizationEmail,
      });

      const organizerEventsCount = await eventsCallection.countDocuments({
        organizationEmail: data?.organizationEmail,
      });

      if (!organizer?.isPremium && organizerEventsCount >= 5) {
        return res.status(401).json({ message: "Your free limit is over" });
      }

      const result = await eventsCallection.insertOne({
        ...data,
        status: "pending",
      });
      res.json(result);
    });

    app.patch("/api/events/:id", async (req, res) => {
      const { id } = req.params;

      const updateData = req.body;

      const result = await eventsCallection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...updateData,
          },
        },
      );
      res.json(result);
    });

    app.delete("/api/events/:id", async (req, res) => {
      const { id } = req.params;
      const result = await eventsCallection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });

    app.path("app/user/upgrade/premium/:email", async (req, res) => {
      const { email } = req.params;
      const result = await userCallection.updateOne(
        { email },
        {
          $set: {
            isPremium: true,
          },
        },
      );
      res.json(result);
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
