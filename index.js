const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173']
}))




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrkijcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  const CollectionOfEvents = client.db("Cyclist-ClubDB").collection("eventsDB")
  const CollectionOfNewsInfo = client.db("Cyclist-ClubDB").collection("newsInfoDB")
  const CollectionOfUsers = client.db("Cyclist-ClubDB").collection("usersDB")
  const CollectionOfContact = client.db("Cyclist-ClubDB").collection("contactDB")
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // events related api
    app.post('/events', async(req,res)=>{
      const event = req.body;
      const result = await CollectionOfEvents.insertOne(event)
      res.send(result)
    })
    app.get('/events', async(req,res)=>{
      const event = req.body;
      const result = await CollectionOfEvents.find(event).toArray()
      res.send(result)
    })

    // news and info related api
    app.post('/newsInfo', async(req,res)=>{
      const news = req.body;
      const result = await CollectionOfNewsInfo.insertOne(news)
      res.send(result)
    })

    app.get('/newsInfo', async(req,res)=>{
      const news = req.body;
      const result= await CollectionOfNewsInfo.find(news).toArray()
      res.send(result) 
    })

    // user related api
    app.post('/users', async(req,res)=>{
      const userInfo = req.body;
      const query = {email: userInfo.email}
      const user = await CollectionOfUsers.findOne(query)
      if(user){
       return  res.send({message: 'user already exit'})
      }
      const result = await CollectionOfUsers.insertOne(userInfo)
      res.send(result)
    })

    app.get('/users', async(req,res)=>{
      const user = req.body;
      const result = await CollectionOfUsers.find(user).toArray()
      res.send(result)
    })

    app.get('/users/:id', async(req,res)=>{
      const userId =  req.params.id;
      const filter = {_id: new ObjectId(userId)}
      const result = await CollectionOfUsers.findOne(filter)
      res.send(result)
    })

    app.delete('/users/:id', async(req,res)=>{
      const userId = req.params.id;
      const filter = {_id: new ObjectId(userId)}
      const result = await CollectionOfUsers.deleteOne(filter)
      res.send(result)
    })

    // contact related api
    app.post('/contact',async(req,res)=>{
      const contact = req.body;
      const result = await CollectionOfContact.insertOne(contact)
      res.send(result)
    })

    app.get('/contact', async(req,res)=>{
      const contact = req.body;
      const result = await CollectionOfContact.find(contact).toArray()
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


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})