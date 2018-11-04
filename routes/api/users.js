const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');


// load Input Validation 
const validatorRegisterInput = require('../../validation/register');
const validatorLoginInput = require('../../validation/login');

//Load User modules

const User = require('../../models/User');

router.get('/test', (req, res) => res.json({msg:"Users Works"}));

router.post('/register', (req, res)=>{
    const {errors, isValid} = validatorRegisterInput(req.body);
   // check validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    
User.findOne({ email: req.body.email})
.then(user => {
    if(user){
        errors.email = 'Email is already exist';
        return res.status(400).json(errors); 
    }
    else{
        const avatar = gravatar.url(req.body.email, {
            s: '200', // Size
            r :'pg', // rating
            d: 'mm' // Default
        })
        const newUser = new User({
            name : req.body.name,
            email : req.body.email,
            avatar,
            password : req.body.password

        });
        bcrypt.genSalt(10, (err, salt) =>{
            bcrypt.hash(newUser.password, salt, (err, hash) =>{
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                .then(user => res.json(user))
                .catch(err => console.log(err));
            })
        })
    }
})
})
router.post('/login', (req, res)=>{
    const {errors, isValid} = validatorLoginInput(req.body);
    // check validation
     if(!isValid){
         return res.status(400).json(errors);
     }
    
    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({email})
    .then(user =>{
        errors.email = 'User not found';
        if(!user){
            return res.status(404).json(errors);
        }
    
    //Check password

        bcrypt.compare(password, user.password).then(isMatch => {
            if(isMatch){
                //User matched
                const payload = {id : user.id, name: user.name, avatar: user.avatar}

                //Sign Tocken
                jwt.sign(payload, keys.secretOrKey,{expiresIn: 3600}, (err, token)=>{
                    res.json({
                        success: true,
                        token: 'Bearer ' + token
                    })
                });
            }
            else{
                errors.password = 'Password incorrect';
                return res.status(400).json(errors)
            }
        })
    })
})

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) =>{
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})

module.exports = router;