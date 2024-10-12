const User = require('../models/user.js')
const {hashPassword, comparePassword} =require('../helpers/auth.js')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const test = (req, res)=>{
    res.json('test is working')
}

const registerUser = async(req,res) =>{
   try {
      const{name, email, password,scienceField} = req.body;
      if(!name){
        return res.json({
            error: 'name is required'
        })
      };
      if(!password || password.length <6){
         return res.json({error: 'password is required and should be atleast 6 character'})
      };
      if(!email){
        return res.json({error:'email is required'})
      };

      const exist = await User.findOne({email});
      if(exist){
        return res.json({error: 'email is already is taken'})
      };
       

      const hashpassword = await hashPassword(password)
      const user = await User.create({
        name , 
        email,
        password: hashpassword,
        scienceField
      });
      return res.json(user)
   } catch (error) {
    console.log(error)
   }
}

//login endpoint
/*
const loginUser = async(req,res)=>{
    try {
      const {email, password} = req.body
      //check if user exists
      const user =await User.findOne({email});

      if(!user){
        return res.json({
          error: 'no user found'
        })
      }
      //check if password match
      const match = await comparePassword(password , user.password)
      if(match){
          const token = jwt.sign({email: user.email, id: user._id , name: user.name, scienceField:user.scienceField},process.env.JWT_SECRET,{},(err,token)=>{
            if(err)throw err;
            //return  res.cookie('token', token).json(user)
            console.log('Generated Token:', token); // Add this line
            res.json({ token });
           })
      }
      if(!match){
       return res.json({error: 'password is not match'})
      }
    } catch (error) {
      console.log(error)
    }
}*/
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        error: 'No user found'
      });
    }

    // Check if password matches
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: 'Password does not match'
      });
    }

    // Determine the role
    const userRole = user.role; // Assuming role is defined in your User schema

    // Generate token
    const token = jwt.sign({
      email: user.email,
      id: user._id,
      name: user.name,
      scienceField: user.scienceField,
      role: userRole // Include the role in the token payload
    }, process.env.JWT_SECRET, {}, (err, token) => {
      if (err) throw err;

      // Log the generated token (for debugging purposes)
      console.log('Generated Token:', token);

      // Return the token and user role
      res.json({
        token,
        role: userRole
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};






module.exports={
    test,
    registerUser,
    loginUser
    
    
    
}