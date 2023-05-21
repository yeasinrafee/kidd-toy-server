const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p4ps1ct.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("kiddToY").collection("toys");

    // For doing the Search option: --------
    const indexKeys = { toy_name: 1 };
    const indexOptions = { name: "toyName" };

    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/search/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await toysCollection
        .find({ toy_name: { $regex: searchText, $options: "i" } })
        .toArray();

      res.send(result);
    });
    //----------------------------------------------

    // For getting Sub-category data
    app.get("/alltoys/:text", async (req, res) => {
      if (
        req.params.text == "Sports" ||
        req.params.text == "Regular" ||
        req.params.text == "Police"
      ) {
        const result = await toysCollection
          .find({ sub_category: req.params.text })
          .toArray();
        return res.send(result);
      }
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    // For getting All data
    app.get("/alltoys", async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/alltoys", async (req, res) => {
      const toys = req.body;
      console.log(toys);
      const result = await toysCollection.insertOne(toys);
      res.send(result);
    });

    // For getting My Toys
    app.get("/myToys/:email", async (req, res) => {
      const result = await toysCollection
        .find({
          seller_email: req.params.email,
        })
        .toArray();
      res.send(result);
    });

    // Delete added
    app.delete("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/alltoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });
    app.put("/alltoy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          details: updatedToy.details,
        },
      };

      const result = await toysCollection.updateOne(filter, toy, option);
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Kid Toy is running");
});

app.listen(port, () => {
  console.log(`Kid toy server is running on port ${port}`);
});
