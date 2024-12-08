const express = require('express')
const jwt = require('jsonwebtoken')
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

    // middleware verify jwt token
    const verifyToken = (req,res,next)=>{
      if(!req.headers.authorization){
        res.status(401).send({ message: "unAuthorize Access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      // console.log(token)
      jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded)=>{
        if(error){
          res.status(401).send({ message: "unAuthorize Access" });
        }
        req.decoded = decoded;
        next()
      })
    }

    // create jwt
    app.post('/jwt',  async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
      res.send({token})
    })

    // events related api
    app.post('/events', verifyToken, async(req,res)=>{
      const event = req.body;
      const result = await CollectionOfEvents.insertOne(event)
      res.send(result)
    })
    app.get('/events', async(req,res)=>{
      // Todo: remove verifyToken
      const event = req.body;
      const result = await CollectionOfEvents.find(event).toArray()
      res.send(result)
    })

    // news and info related api
    app.post('/newsInfo', verifyToken, async(req,res)=>{
      const news = req.body;
      const result = await CollectionOfNewsInfo.insertOne(news)
      res.send(result)
    })

    app.get('/newsInfo',  async(req,res)=>{
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

    app.get('/users', verifyToken, async(req,res)=>{
      const user = req.body;
      const result = await CollectionOfUsers.find(user).toArray()
      res.send(result)
    })

    app.get('/users/:id', verifyToken, async(req,res)=>{
      const userId =  req.params.id;
      const filter = {_id: new ObjectId(userId)}
      const result = await CollectionOfUsers.findOne(filter)
      res.send(result)
    })

    app.delete('/users/:id', verifyToken, async(req,res)=>{
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

    app.get('/contact',  async(req,res)=>{
      const request = req.body;
      const result = await CollectionOfContact.find(request).toArray()
      res.send(result)
    })

    app.get('/contact/:id',  async(req,res)=>{
      const userId =  req.params.id;
      const filter = {_id: new ObjectId(userId)}
      const result = await CollectionOfContact.findOne(filter)
      res.send(result)
    })

    app.delete('/contact/:id', async(req,res)=>{
      const userId = req.params.id;
      const filter = {_id: new ObjectId(userId)}
      const result = await CollectionOfContact.deleteOne(filter)
      res.send(result)
    })

    // make admin related api

    app.patch('/user/admin/:id', verifyToken, async(req,res)=>{
      const userId = req.params.id;
      const query = {_id : new ObjectId(userId)}
      const updateDoc ={
        $set:{
          role: 'admin'
        }
      }
      const result = await CollectionOfUsers.updateOne(query, updateDoc)
      res.send(result)

    })

    // make moderator related api
    app.patch('/user/moderator/:id', async(req,res)=>{
      const moderatorId = req.params.id;
      const filter = {_id: new ObjectId(moderatorId)}
      const updateDoc = {
        $set: {
          role: 'moderator'
        }
      }
      const result = await CollectionOfUsers.updateOne(filter, updateDoc)
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