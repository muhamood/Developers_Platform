const { json } = require('express');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post Model
const Post = require('../../models/Post');

//Profile Model
const Profile = require('../../models/Profile');

//validation
const validatePostInput = require('../../validation/post');

//@route  GET api/posts/test
//@desc  tests posts route
//@accss  Public
 router.get('/test', (req, res)=> res.json({msg:'posts works'}));

//@route  POST api/posts
//@desc    Create posts
//@accss   Public
router.get('/', (req, res)=>{
    Post.find()
        .sort({date:-1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({nopostsfound:'No posts found'}));
})

//@route  POST api/posts/:id
//@desc    Create posts by id
//@accss   Public
router.get('/:id', (req, res)=>{
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound:'No post found with that ID'}));
})

//@route  POST api/posts
//@desc    Create post
//@accss   Private
router.post('/', passport.authenticate('jwt', {session:false}), (req,res)=>{
const {errors, isValid} = validatePostInput(req.body);

   //check validations
   if(!isValid){
       return res.status(400).json(errors);
   }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post =>res.json(post)); 
});

//@route   Delete api/posts/:id
//@desc    Delete post
//@accss   Public
router.delete('/:id', passport.authenticate('jwt', {session:false}), (req, res) =>{
      Profile.findOne({user: req.user.id})
      .then(profile =>{
          Post.findById(req.params.id)
          .then(post =>{
              //check for the owner
              if(post.user.toString() !== req.user.id){
                  return res.status(401).json({notauthorized:'User not authorized'});
              }
              //Delete
              post.remove().then(()=>res.json({
                 success:true
              }));
          })
          .catch(err => res.status(404).json({postnotfound:'No post found'}))
      })
})

module.exports = router;