const express = require('express')
const cors = require("cors");
const { MongoClient, ServerApiVersion,ObjectId} = require('mongodb');
require('dotenv').config();



const app = express()
const port = 3000


// middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})



// const uri = "mongodb+srv://pawmart_db:QpSeO2f9dQ52aZYc@cluster0.e80xsto.mongodb.net/?appName=Cluster0";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e80xsto.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


 const db = client.db("pawmart_db");
    const productCollection = db.collection("listing");
    const orders=db.collection("orders")

     app.get("/listing",async(req,res)=>{
        const result= await productCollection.find().toArray()
         
        res.send(result)
    })
     app.get("/orders",async(req,res)=>{
        const result= await orders.find().toArray()
        res.send(result)
    })

    app.get("/current-listing", async(req,res)=>{
        const result= await productCollection.find().sort({date: -1 }).limit(6).toArray()
        res.send(result)
    })

    app.get("/listing/:id",async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await productCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    
        app.get('/products/orders/:productId',async (req, res) => {
            const productId = req.params.productId;
            const query = { product: productId }
            const cursor = orders.find(query).sort({price: -1 })
            const result = await cursor.toArray();
            res.send(result);
        }) 
    //  orders collection 
        app.post('/orders', async (req, res) => {
            const newProduct = req.body;
            const result = await orders.insertOne(newProduct);
            res.send(result);
        })
        // my orders 

         // post 
    app.post("/post-product",async (req, res) => {
      const data = req.body;
      // console.log(data)
      const result = await productCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    }); 

    // my listing
     app.get("/my-products",async(req, res) => {
      const email = req.query.email
      const result = await productCollection.find({email: email}).toArray()
      res.send(result)
    })

    // my order 
     app.get("/my-orders",async(req, res) => {
      const email = req.query.email
      const result = await orders.find({email: email}).toArray()
      res.send(result)
    })
  









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
