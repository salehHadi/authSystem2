require('dotenv').config();
require('./config/database').connect();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./model/user');

const app = express();
app.use(express.json());


app.get('/', async (req, res) => {
    res.send('<h1>this is Saleh</h1>');
});

app.post('/register',async (req, res) => {

    try {
        const {firstname, lastname, email, passsword} = req.body;
        if(!(email && passsword && firstname && lastname )) {
            res.status(400).send(` all filed are requeired`);
        };
    
        const exsistingUser = await User.findOne({email: req.body.email})
        if(exsistingUser) {
            res.status(400).send(` User Already exsisit`);
        }
    
        const securePassword = await bcrypt.hash(passsword, 10)
    
        const user = await User.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            passsword: securePassword
        });
    
        const token = jwt.sign(
            {user_id: user._id, email},
            process.env.SECRET_KEY,
            {expiresIn: "2h"}
        )
    
        user.token = token;
        
        res.status(201).send(user)

    } catch (err) {
        console.log(err)
    }


});


module.exports = app