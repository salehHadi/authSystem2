require('dotenv').config();
require('./config/database').connect();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./model/user');
const auth = require('./middleware/auth')

const app = express();
app.use(express.json());
app.use(cookieParser());


app.get('/', async (req, res) => {
    res.send('<h1>this is Saleh</h1>');
});

app.post('/register',async (req, res) => {

    try {
        const {firstname, lastname, email, password} = req.body;
        if(!(email && password && firstname && lastname )) {
            res.status(400).send(` all filed are requeired`);
        };
    
        const exsistingUser = await User.findOne({email: req.body.email})
        if(exsistingUser) {
            res.status(400).send(` User Already exsisit`);
        }
    
        const securePassword = await bcrypt.hash(password, 10)
    
        const user = await User.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: securePassword
        });
    
        const token = jwt.sign(
            {user_id: user._id, email},
            process.env.SECRET_KEY,
            {expiresIn: "2h"}
        )
    
        user.token = token;

        user.password = undefined;
        
        res.status(201).send(user)

    } catch (err) {
        console.log(err)
    }


});

app.post('/login', async (req, res) => {

    try {
        const {email, password} = req.body;
        if (!(email && password)){
            res.status(301).send('All filed are required')
        }
        const userInfo = await User.findOne({email})
    
        if (userInfo && (await bcrypt.compare(password, userInfo.password))) {
            const token = jwt.sign(
                {user_id: userInfo._id, email},
                process.env.SECRET_KEY,
                {
                    expiresIn: "2h"
                }
            )

            userInfo.token = token
            userInfo.password = undefined
            // res.status(200).json(userInfo)
            
            // if I want to use cookies, only for the web.
            const option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 ),
                httpOnly: true 
            }

            res.status(200).cookie('token', token, option).json({
                success: true,
                token,
                userInfo
            })
        }

        res.status(301).send(`email or password are incorrect`)
    } catch (error) {
        console.log(error)
    }

})

app.get('/dashboard', auth, (req , res) => {
    res.send('this is secret information')
})

module.exports = app