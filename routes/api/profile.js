const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation

const validateprofileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Load profile Model
const Profile = require('../../models/Profile');
//Load User Profile

const User = require('../../models/User');

router.get('/test', (req, res) => res.json({msg:"profile Works"}));

router.get('/', passport.authenticate('jwt', {session:false}),(req, res ) =>{
   const errors ={};
   Profile.findOne({user: req.user.id})
   .populate('user',['name', 'avatar']) 
   .then(profile => {
       if(!profile){
           errors.noprofile ='Thre is no profile for this user';
           return res.status(400).json(errors);
       }
       res.json(profile);
   })
   .catch(err => res.status(404).json(err));
});

router.get('/all', (req, res) => {
    const errors = {};
  
    Profile.find()
      .populate('user', ['name', 'avatar'])
      .then(profiles => {
        if (!profiles) {
          errors.noprofile = 'There are no profiles';
          return res.status(404).json(errors);
        }
  
        res.json(profiles);
      })
      .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
  });

router.get('/handle/:handle', (req, res) => {
    Profile.findOne({handle: req.params.handle})
    .populate('user',['name', 'avatar']) 
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));

})
router.get('/user/:user_id', (req, res) => {
    Profile.findOne({user: req.params.user_id})
    .populate('user',['name', 'avatar']) 
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));

})



router.post('/', passport.authenticate('jwt', {session:false}),(req, res ) =>{
  const {errors, isValid} = validateprofileInput(req.body);
  if(!isValid){
      //return any error with 400 status
      return res.status(400).json(errors);
  } 
  
  //Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
 // Skills - Split into array
  if(typeof req.body.skills !== 'undefined'){
      profileFields.skills = req.body.skills.split(',');
  }
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin  ;
  if(req.body.istagram) profileFields.social.istagram = req.body.istagram;

  Profile.findOne({user : req.user.id}).then(profile => {
      if(profile){
          Profile.findOneAndUpdate(
              {user : req.user.id},
              {$set : profileFields},
              {new : true}
          ).then(profile => res.json(profile));
      } else {
          // Create 

          // Check if handle exists
          Profile.findOne({ handle : profileFields.handle}).then(profile => {
              if(profile){
                  errors.handle = ' That handle already exits';
                  res.status(400).json(errors);
              }
              // save profile
              new Profile(profileFields).save()
              .then(profile => res.json(profile));
          })
      }
  })

});

router.post(
    '/experience',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const { errors, isValid } = validateExperienceInput(req.body);
  
      // Check Validation
      if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
      }
  
      Profile.findOne({ user: req.user.id }).then(profile => {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
  
        // Add to exp array
        profile.experience.unshift(newExp);
  
        profile.save().then(profile => res.json(profile));
      });
    }
  );

  router.post(
    '/education',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const { errors, isValid } = validateEducationInput(req.body);
  
      // Check Validation
      if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
      }
  
      Profile.findOne({ user: req.user.id }).then(profile => {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
  
        // Add to exp array
        profile.education.unshift(newEdu);
  
        profile.save().then(profile => res.json(profile));
      });
    }
  );

  router.delete(
    '/experience/:exp_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id })
        .then(profile => {
          // Get remove index
          const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);
  
          // Splice out of array
          profile.experience.splice(removeIndex, 1);
  
          // Save
          profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
    }
  );

  router.delete(
    '/education/:edu_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id })
        .then(profile => {
          // Get remove index
          const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);
  
          // Splice out of array
          profile.education.splice(removeIndex, 1);
  
          // Save
          profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
    }
  );

  router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOneAndRemove({ user: req.user.id }).then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() =>
          res.json({ success: true })
        );
      });
    }
  );

module.exports = router;