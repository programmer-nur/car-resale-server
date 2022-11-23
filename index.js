const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.Port || 5000;


// Midelware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tcnszhx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){ 
    try {
        const categoriesCollection =client.db('carResale').collection('categories')
        const carsCollection =client.db('carResale').collection('cars')

        app.get('/categories', async(req,res)=>{
            const query={}
            const result= await categoriesCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/categories:id',async (req,res)=>{
            const id = req.params.id
            const query = {}
            const cars = await carsCollection.find(query).toArray()
            const categories_id =cars.filter(car=> car.category_id === id)
            res.send(categories_id)
        })

        app.get('/cars',async(req,res)=>{
            const query={}
            const result= await carsCollection.find(query).toArray()
            res.send(result)
        })


        app.get('/',(req,res)=>{
            res.send('CAr KInba')
        })


    } catch (error) {
        console.log(error)
        
    }
}
run()
app.listen(port, ()=>{
    console.log("Car Server is running",port);
})