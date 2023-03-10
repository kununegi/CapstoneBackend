const fs = require ('fs')
const {validationResult} = require('express-validator');
const mongoose = require ('mongoose');
const HttpError = require('../models/error.js');
const getCoordsForAddress = require('../Util/location');
const Place = require ('../models/place.js')
const User = require ('../models/user')


const getPlacesById= async(req, res, next) => {
    const placeId = req.params.pid
   let place;  
    try {
        place = await Place.findById(placeId);
        
    }catch (err) {
        const error = new HttpError ('Something went wrong, could not find a place.');
        return next (error);
          
        } 
    
    if (!place){
        const error = new HttpError ('Could not find place for provided id', 404);
    return next (error);
    }
    res.send({place:place.toObject({getters:true})});   
    }

const getUsersById = async(req,res, next)=>{
    const userId=req.params.uid;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');

    }catch (err){
        const error = new HttpError(' Fetching Place Failed,Please try again'
        );
        return next (error)
       } 
   
        if (!userWithPlaces || userWithPlaces.places.length === 0){
        return next(
         new HttpError ('Could not find places for provided id', 404)
        );
    }
   
    res.send({places:userWithPlaces.places.map(place=>place.toObject({getters:true}))});
};


const createPlace = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next( new HttpError('Invalid input passed, please check your data'))
    }
   const { title, description, address, creator} = req.body;
   let coordinates;
   try{
        
    coordinates = await getCoordsForAddress(address);
   
   }catch (error){
     return next (error);
   }     

   let createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:req.file.path,
    creator
   });
   let user;
   try {
    user = await User.findById(creator);
   }catch (err){
    const error = new HttpError(
        'Creatin Place failed, please try again'
    );
    return next (error)
   }
    if (!user){
        const error = new HttpError ('Could not find user for provided id');
        return next(error);
    }
    console.log(user);

   try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace);
    await user.save({session:sess});
    await sess.commitTransaction();    
   }catch (err){
    const error = new HttpError('Creating Place Failed,Please try again'
    );
    return next (error)
   }
    res.status (201).send({place: createdPlace});
    //  res.status(201).send({place:createdPlace.toObject({getters : true})})
      
};


const updatePlace = async (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next ( new HttpError('Invalid input passed, please check your data')
    )}
    const { title, description} = req.body;
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId)
    } catch (err){
        const error = new HttpError(
            'Something went wrong, could not update place.'
        );
        return next (error)
       }
    
    place.title = title;
    place.description = description;

    try{
        await place.save();
    } catch (err){
        const error = new HttpError(
            'Something went wrong, could not update place.'
        );
        return next (error)
       }
    
    res.status(200).send({place:place.toObject({getters:true})})
};  

const deletePlace =async(req, res, next)=>{
    const placeId=req.params.pid;
   let place;
   try{
    place = await Place.findById(placeId).populate('creator');
   } catch (err){
    const error = new HttpError(
        'Something went wrong, could not delete place.'
    );
    return next (error)
   }
 
 if (!place){
    const error = new HttpError('Could not found place for this id');
    return next (error);
 }
 const imagePath = place.image;
 try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session:sess});
    await sess.commitTransaction();

 } catch (err){
    const error = new HttpError(
        'Something went wrong, could not delete place.'
    );
    return next (error)
   }
   fs.unlink(imagePath, err =>{
    console.log(err);
   })
   
    res.status(200).send({message : 'Deleted place.'})
};



module.exports={getPlacesById, getUsersById, createPlace,updatePlace,deletePlace}   

