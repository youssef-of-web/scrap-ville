const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const router = require('./router')
const data = require('./data/countriesV1.json')



//Set up default mongoose connection
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`DATA BASE CONNECTED`))
    .catch(err => console.log(`${err}`))


data ? console.log(data.Country.length) : ''

app.use('/api', router)

/* start server */
const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server running on port ${port} 🔥`));