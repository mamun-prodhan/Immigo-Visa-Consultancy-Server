const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nhx4fnh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
       return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('assignment11').collection('services');
        const countryCollection = client.db('assignment11').collection('country');
        const reviewCollection = client.db('assignment11').collection('reviews');

        // JWT TOKEN
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token})
        })



        // for country section
        app.get('/country', async (req, res) => {
            const query = {}
            const cursor = countryCollection.find(query);
            const country = await cursor.toArray();
            res.send(country);
        });

        // 3 service for home page
        app.get('/services', async (req, res) => {
            const query = {};
            
            const cursor = serviceCollection.find(query).sort( { insertDate : -1} ).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });

        // add service api
        app.post('/services', async(req, res) =>{
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // all services for service page
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            
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

        // all reviews api==========
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }
            const cursor = reviewCollection.find(query).sort( { insertDate : -1} );
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // myreviews api jwt
        app.get('/myreviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const myreviews = await cursor.toArray();
            res.send(myreviews);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review); 
            res.send(result);
        });
          
        app.delete('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

        app.put('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const data = req.body;
            const updateDoc = {
                $set: {
                    "customer": data.customer,
                    "email": data.email,
                    "review": data.review
                },
            };
            const result = await reviewCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });

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