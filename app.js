//https://www.youtube.com/watch?v=NsEtMuMjDAc by Tutor Joes tamil -- Completed
// to start server --- npm start

const express = require('express');
const path = require('path')
const dotenv = require("dotenv").config()
const connectDb = require('./config/mongoDB')
const hbs = require('hbs')
const errorHandler = require("./middleware/errorHandler")
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const cors = require('cors');
const corsOptions= require('./config/corsOptions')




connectDb()

const app = express();
app.use(express.json());

app.use(cookieParser())

app.use(cors(corsOptions));

app.use(express.urlencoded({extended:false}))  //it is importent to get req boy from browser

const location = path.join(__dirname,"./public")
app.use(express.static(location))

app.set('view engine',"hbs");

hbs.registerHelper('add', function(str1, str2) {
    return str1 + str2;
  });

const partialPath = path.join(__dirname, "./views/partials")
hbs.registerPartials(partialPath)


app.use('/', require('./routes/pages'))

app.use('/auth', require("./routes/auth"))


app.use(errorHandler)

app.listen(3000, () => {
    console.log("Server runs at port 3000");
})