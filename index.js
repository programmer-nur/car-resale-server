const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { query } = require('express');
const Stripe = require('stripe')
require('dotenv').config()
const port = process.env.Port || 5000;
const stripe = Stripe(process.env.DB_STRIP_SK)

const corsOptions = {
    origin: 'https://car-resale-d6efe.web.app',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json())
app.use((req, res, next) => {
    cors(corsOptions)(req, res, next);
});

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('Unauthorized')
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.DB_ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded
        next()
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tcnszhx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        const categoriesCollection = client.db('carResale').collection('categories')
        const carsCollection = client.db('carResale').collection('cars')
        const ordersCollection = client.db('carResale').collection('orders')
        const usersCollection = client.db('carResale').collection('users')
        const reportsCollection = client.db('carResale').collection('reports')
        const reviewsCollection = client.db('carResale').collection('reviews')
        const paymentsCollection = client.db('carResale').collection('payments')

        //------------------Get Api-------------

        // All Categories
        app.get('/categories', async (req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).toArray()
            res.send(result)
        })

        // Single category
        app.get('/categories:id', async (req, res) => {
            const id = req.params.id
            const query = {}
            const cars = await carsCollection.find(query).toArray()
            const categories_id = cars.filter(car => car.category_id === id)
            res.send(categories_id)
        })
        // All Reviews
        app.get('/reviews', async (rew, res) => {
            const query = {}
            const reviews = await reviewsCollection.find(query).toArray()
            res.send(reviews)
        })
        // All Products
        app.get('/cars', async (req, res) => {
            const query = {}
            const result = await carsCollection.find(query).toArray()
            res.send(result)
        })
        // Single Product
        app.get('/cars/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const car = await carsCollection.findOne(query)
            res.send(car)
        })
        // Single Order
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const order = await ordersCollection.findOne(query)
            res.send(order)
        })

        // Specifie User All Orders

        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email
            const decodedEmail = req.decoded.email
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
            const query = { email: email }
            const result = await ordersCollection.find(query).toArray()
            res.send(result)
        })


        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })


        // All Users
        app.get('/users', verifyJWT, async (req, res) => {
            const query = {}
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })

        // All Buyer
        app.get('/user', verifyJWT, async (req, res) => {
            let query = {}
            if (req.query.role == 'Buyer') {
                query = {
                    role: req.query.role
                }
            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        // My Product 
        app.get('/myCars', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = { email: email }
            const result = await carsCollection.find(query).toArray()
            res.send(result)
        })

        // All Report
        app.get('/reports', async (req, res) => {
            const query = {};
            const result = await reportsCollection.find(query).toArray()
            res.send(result)
        })

        // All Sealer

        app.get('/userSealer', verifyJWT, async (req, res) => {
            let query = {}
            if (req.query.role == 'Sealer') {
                query = {
                    role: req.query.role
                }
            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })


        //------------------Post Api-------------
        // Create New Product
        app.post('/report', async (req, res) => {
            const query = req.body
            const result = await reportsCollection.insertOne(query)
            res.send(result)
        })
        // Create New Products
        app.post('/cars', async (req, res) => {
            const query = req.body
            const result = await carsCollection.insertOne(query)
            res.send(result)
        })

        // Create New User Added
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        // Create Order in User
        app.post('/orders', async (req, res) => {
            const query = req.body
            const result = await ordersCollection.insertOne(query)
            res.send(result)
        })



        // Jwt api
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const user = { email: email }
            if (user && user.email) {
                const token = jwt.sign({ email }, process.env.DB_ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ Token: token })
            }
            const result = await usersCollection.findOne(user)
            console.log(result)
            res.status(403).send('Unbenden')
        })

        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await carsCollection.deleteOne(query)
            res.send(result)
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })





        // Admin Api

        // Create Admin

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user.role !== 'admin') {
                res.status(403).send({ message: 'Forbidden Access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        });

        app.put('/users/verify/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user.role !== 'admin') {
                res.status(403).send({ message: 'Forbidden Access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    verify: true
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        });


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ isAdmin: user?.role === 'admin' })
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ isBuyer: user?.role === 'Buyer' })
        })

        app.get('/users/sealer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ isSealer: user?.role === 'Sealer' })
        })

        // --------Payment Api---------

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            console.log(result);
            const id = payment.orderId;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await ordersCollection.updateOne(filter, updateDoc)

            res.send(result)
        })

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.productPrice;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.get('/', (req, res) => {
            res.send('Car Seal')
        })

    } catch (error) {
        console.log(error)

    }
}
run()
app.listen(port, () => {
    console.log("Car Server is running", port);
})