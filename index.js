const fs = require ('fs');
// const expressStatic = require("express-static-search");
const path = require ('path');
const express = require ('express');
const bodyParser = require('body-parser');
const mongoose = require ('mongoose')

const placeRoute = require('./routes/placeRoute');
const usersRoute = require('./routes/UsersRoute.js');
const HttpError = require('./models/error.js')
const cors = require("cors");
const app = express();

app.use(bodyParser.json())
const port = 4000
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
// app.use(express.static('uploads/images'));




app.use(cors())
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type,Accept, Authorization' );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH,DELETE');
    next();
});
app.use('/api/places',placeRoute);
app.use('/api/users',usersRoute);

app.use((req,res,next)=>{
    const error = new HttpError('Could not found this route.', 404);
    throw error;
});
app.use((error, req, res,next)=>{
   if (req.file){
    fs.unlink(req.file.path,err=>{
        console.log(err);
    });
   }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500)
    res.send({message : error.message || "An unknown error occured"})
});
mongoose.set('strictQuery', true);
mongoose
.connect('mongodb+srv://kununegi:sart2003@cluster0.shrbugl.mongodb.net/capstone?retryWrites=true&w=majority')
.then(()=>{
    app.listen(port, () => {
            console.log(`Example app 
            listening at 
            http://localhost:${port}`)
            })
})
.catch(err=>{
    console.log(err)
});



    






