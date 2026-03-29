import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import asyncHandler from '../utils/async-handler.js';

//function for generating jwt tokens
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export const register = asyncHandler(async (req,res) =>{
    const {name, email, password} = req.body

    if(!name || !email || !password){
        return res.status(400).json({success:false, error:"Please provide name, email and password"})
    }

    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({success:false, error:"User with this email already exists"})
    }

    const user = await User.create({name,email,password})
    const token = generateToken(user._id)

    res.status(201).json({
        success:true,
        token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })
})

export const login = asyncHandler(async (req,res) =>{
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({success:false, error:"Please provide email and password"})
    }

    const user = await User.findOne({email})
    if(!user){
        return res.status(401).json({
            success:false,
            message:"Invalid email or password"
        })
    }

    const isMatch = await user.comparePassword(password)
    if(!isMatch){
        return res.status(401).json({
            success:false,
            message:"Invalid email or password"
        })
    }

    const token = generateToken(user._id)

    res.status(200).json({
        success:true,
        token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })

})

export const getMe = asyncHandler(async (req,res) =>{
    res.status(200).json({
        success:true,
        user:{
            id:req.user._id,
            name:req.user.name,
            email:req.user.email
        }
    })
})

