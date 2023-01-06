const {validationResult} = require('express-validator');

const HttpError = require('../models/error.js')
const User = require('../models/user.js')



const getUsers = async (req,res, next)=>{
    let users;
    try{
        users =await User.find({},'-password');

    }catch (err) {
      const error = new HttpError ('Fetching users failed, please try again later');
      return next (error);
        
      }   
   
    res.send({users:users.map(user => user.toObject({ getters:true}))});
};

const signup = async (req,res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        return next( new HttpError('Invalid input passed, please check your data')
    )}
    const { name, email, password} = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email:email})

    } catch (err) {
      const error = new HttpError ('Signing up failed, please try again later');
      return next (error);
        
      }   

      if (existingUser){
        const error = new HttpError('User exists already, please login instead'
        );
        return next (error)

      }
    const createdUser = new User({
        name,
        email,
        image:req.file.path,
        // image:'https://cdn.pixabay.com/photo/2022/01/03/01/00/ruins-6911495_960_720.jpg',
        password,
        places:[]
    });
     try {
        await createdUser.save();
     } catch (err) {
      const error = new HttpError ('Signing up failed, please try again later');
      return next (error);
        
      }       
    res.status(201).send({user: createdUser.toObject({getters:true})});
};
    
const login = async (req,res,next)=>{
    const {email, password} = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email:email})

    } catch (err) {
      const error = new HttpError ('Loggin in failed, please try again later');
      return next (error);
        
      }   
      if(!existingUser || existingUser.password !==password){
        const error = new HttpError('Invalid credentials, could not log you in')
     return next (error)
    }
    res.send ({message:'logged in', 
    user : existingUser.toObject({getters:true})})
    
};






module.exports ={getUsers, signup, login}