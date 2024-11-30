 const express = require('express')
 const app = express()
 var cors = require('cors')
 const mongoose = require('mongoose')
 const path = require('path')
 const {MONGOURI} = require('./keys')
 const PORT = process.env.PORT || 5000

 app.use(cors())
mongoose.Promise = global.Promise
 mongoose.connect(MONGOURI).then(() => console.log('MongoDB connected'))
 .catch(err => console.log("++++ Error in mongodb connection +++++",err));
 
 app.use(express.static(path.join(__dirname, "build")));
 require('./models/user')
 require('./models/post')

 app.use(express.json())
 app.use(require('./routes/auth'))
 app.use(require('./routes/post'))
 app.use(require('./routes/user'))

app.listen(PORT,() => {
    console.log('Server is running on ',PORT)
})