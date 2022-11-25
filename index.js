const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { query } = require('express');
require('dotenv').config()
const port = process.env.Port || 5000;


// Midelware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tcnszhx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const categoriesCollection = client.db('carResale').collection('categories')
        const carsCollection = client.db('carResale').collection('cars')
        const ordersCollection = client.db('carResale').collection('orders')
        const usersCollection = client.db('carResale').collection('users')

        //------------------Get Api-------------

        app.get('/categories', async (req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/categories:id', async (req, res) => {
            const id = req.params.id
            const query = {}
            const cars = await carsCollection.find(query).toArray()
            const categories_id = cars.filter(car => car.category_id === id)
            res.send(categories_id)
        })

        app.get('/cars', async (req, res) => {
            const query = {}
            const result = await carsCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const car = await carsCollection.findOne(query)
            res.send(car)
        })

        app.post('/cars', async(req,res)=>{
            const query=req.body
            const result=await carsCollection.insertOne(query)
            res.send(result)
        })
        app.get('/', (req, res) => {
            res.send('CAr KInba')
        })

        app.get('/orders/:id', async(req,res)=>{
            const id = req.params.id;
            const query={_id:ObjectId(id)}
            const order= await ordersCollection.findOne(query)
            res.send(order)
        })
        app.get('/orders',async(req,res)=>{
            const email = req.query.email
            const query = {email: email}
            const result = await ordersCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/orders', async (req, res) => {
            const query = req.body
            const result = await ordersCollection.insertOne(query)
            res.send(result)
        })


        app.get('/users', async(req,res)=>{
            const query = {}
            const users= await usersCollection.find(query).toArray()
            res.send(users)
          })
          
         
      app.get('/user',async(req,res)=>{
        let query ={}
        if(req.query.opinion== 'Buyer'){
            query={
                opinion:req.query.opinion
            }
        }
        const result = await usersCollection.find(query).toArray()
        res.send(result)
      })
      app.get('/userSealer',async(req,res)=>{
        let query ={}
        if(req.query.opinion== 'Sealer'){
            query={
                opinion:req.query.opinion
            }
        }
        const result = await usersCollection.find(query).toArray()
        res.send(result)
      })

      app.get('/jwt', async(req,res)=>{
        const email=req.query.email;
        const user = {email:email}
        if(user && user.email){
           const token= jwt.sign({email},process.env.DB_ACCESS_TOKEN, {expiresIn:'1d'})
           return res.send({Token:token})
        }
        const result = await usersCollection.findOne(user)
        console.log(result)
        res.status(403).send('Unbenden')
      })
      app.delete('/users/:id', async(req,res)=>{
        const id = req.params.id;
        const query ={_id:ObjectId(id)}
        const result= await usersCollection.deleteOne(query)
        res.send(result)
      })
    //   app.delete('/users/:email', async(req,res)=>{
    //     const email = req.params.email;
    //     const query ={email:email}
    //     const result= await usersCollection.deleteOne(query)
    //     res.send(result)
    //   })
        //   app.get('/users/admin/:email', async (req,res)=>{
        //     const email = req.params.email;
        //     const query = {email}
        //     const user = await usersCollection.findOne(query)
        //     res.send({isAdmin: user?.role === 'admin'})
        //   })
      
          app.post('/users', async (req,res)=>{
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
          })

    } catch (error) {
        console.log(error)

    }
}
run()
app.listen(port, () => {
    console.log("Car Server is running", port);
})