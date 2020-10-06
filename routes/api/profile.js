const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport'); 

// load Profile model 
const Profile = require('../../models/Profile');

//load User profile
const User = require('../../models/User');

 //@route  GET api/profile/test
 //@desc  tests profile route
 //@accss  Public
 router.get('/test', (req, res)=> res.json({msg:'profile works'}));

 //@route  GET api/profile
 //@desc  Get current users profile
 //@accss  Private
router.get('/', passport.authenticate('jwt', {session:false}), (req, res)=>{
    const errors= {};
   Profile.findOne({user:req.body.id})
        .then(profile =>{
          if(!profile){
              errors.noprofile = 'There is no profile for this user';
              return res.status(404).json(errors);
          }
           res.json(profile);
        })
        .catch(err => res.status(404).json(err))
    });



 module.exports = router;