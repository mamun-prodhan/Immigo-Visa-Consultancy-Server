const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nhx4fnh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('assignment11').collection('services');
        const countryCollection = client.db('assignment11').collection('country');
        const reviewCollection = client.db('assignment11').collection('reviews');

        // for country section
        app.get('/country', async (req, res) => {
            const query = {}
            const cursor = countryCollection.find(query);
            const country = await cursor.toArray();
            res.send(country);
        });

        // 3 service for home page
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3);
            // const cursor = serviceCollection.find(query,{"title":1,_id:0}).sort({"title":-1}).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });

        // all services for service page
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            // const cursor = serviceCollection.find(query,{"title":1,_id:0}).sort({"title":-1}).limit(3);
            const allservices = await cursor.toArray();
            res.send(allservices);
        });

        // single service details page
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // all reviews api
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // myreviews api==========
        app.get('/myreviews', async(req, res) =>{
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const myreviews = await cursor.toArray();
            res.send(myreviews);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(err => console.error(err));



app.get('/', (req, res) => {
    res.send('assignment 11 is running')
})

app.listen(port, () => {
    console.log(`assignment 11 is running on port ${port}`);
})