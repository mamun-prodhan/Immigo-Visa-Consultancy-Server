const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nhx4fnh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('assignment11').collection('services');
        const countryCollection = client.db('assignment11').collection('country');

        app.get('/country', async(req, res) =>{
            const query = {}
            const cursor = countryCollection.find(query);
            const country = await cursor.toArray();
            res.send(country); 
        })

        app.get('/services', async(req, res) =>{
            const query = {}
            const cursor = serviceCollection.find(query).limit(3);
            // const cursor = serviceCollection.find(query,{"title":1,_id:0}).sort({"title":-1}).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        })
        
        app.get('/allservices', async(req, res) =>{
            const query = {}
            const cursor = serviceCollection.find(query);
            // const cursor = serviceCollection.find(query,{"title":1,_id:0}).sort({"title":-1}).limit(3);
            const allservices = await cursor.toArray();
            res.send(allservices);
        })
    }
    finally{

    }
}

run().catch(err => console.error(err));



app.get('/', (req, res) =>{
    res.send('assignment 11 is running')
})

app.listen(port, () =>{
    console.log(`assignment 11 is running on port ${port}`);
})