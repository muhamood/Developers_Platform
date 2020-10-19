const express = require('express');
const router = express.Router();

const gravator = require('gravatar');
const bcrypt = require('bcryptjs');
const keys = require('../../config/keys');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

//Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//@route  GET api/users/test
//@desc  tests users route
//@accss  Public
router.get('/test', (req, res) => res.json({ msg: 'users works' }));

//@route  POST api/users/register
//@desc  register users route
//@accss  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //check Validation
    // if (!isValid) {
    //     console.log('validation');
    //     return res.status(400).json(errors);
    // }

    User.findOne({ email: req.body.email }).then((user) => {
        console.log('find');
        const avatar = gravator.url(req.body.email, {
            s: '200',
            r: 'pg',
            d: 'mm',
        });

        if (user) {
            console.log('error');
            errors.email = 'Email already exists';
           return res.status(400).json(errors);
        } else {
            console.log('created');
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar,
            });
          console.log('users..');
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    (newUser.password = hash),
                        newUser
                            .save()
                            .then(user => res.status(201).json({user, msg:'You have succesfully registered a user'})) 
                            .catch((err) => console.log(err));
                });
            });
        }
    });
});
//@route  GET api/users/cuurent
//@desc  Return current user
//@accss  Private
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
        });
    }
);

//@route  GET api/users/login
//@desc  Login user/ returning token
//@accss  Public
router.post('/login', (req, res) => {
    
    const { errors, isValid } = validateLoginInput(req.body);

    // //check Validation
    // if (!isValid) {
    //     console.log(errors);
    //     return res.status(400).json(errors);
    // }

    const email = req.body.email;
    const password = req.body.password;
    console.log('entered login');
    User.findOne({ email }).then((user) => {
        errors.email = 'User not found';
        console.log('user found',user);
        //check user
        if (!user) {
            console.log('user not found',user);
            return res.status(404).json(errors);
        }

        // check for password
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                console.log('matched user =========================================================================================================>');
                //user matched
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                };

                //Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token,
                        });
                    }
                );
            } else {
                console.log('failed user =========================================================================================================>');
                errors.password = 'Password incorrect';
                return res.status(400).json(errors);
            }
        });
    });
});

module.exports = router;
