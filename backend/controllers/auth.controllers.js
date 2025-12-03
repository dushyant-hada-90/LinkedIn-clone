import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../config/token.js"

export const signup = async (req,res)=>{
    try {
        let {firstName,lastName,userName,email,password} = req.body
        // basic checks if it already exists
        let existEmail = await User.findOne({email}) 
        if (existEmail){
            return res.status(400).json({message:"email already exists !"})
        }
        let existUsername = await User.findOne({userName}) 
        if (existUsername){
            return res.status(400).json({message:"username already exists !"})
        }
        if (password.length < 8){
            return res.status(400).json({message:"password length must be 8 characters"})
        }
        // hashing
        let hashedPassword = await bcrypt.hash(password,10)
        // create user
        const user = await User.create(
            {
                firstName,
                lastName,
                userName,
                email,
                password : hashedPassword,
            }
        )
        console.log(user);
        
        // create token
        let token = genToken(user._id)
        // put token into cookie
        res.cookie("token",token,{
            httpOnly : true,
            maxAge : 7*24*60*60*1000,
            sameSite : "strict",
            secure : process.env.NODE_ENVIRONMENT==="production"
        })
        // return response
        return res.status(201).json({user,message:"Signed up Successfully"})
    } catch (error) {
        return res.status(500).json({error,message:"something went wrong"})
    }
}



export const login = async (req,res)=>{
    try {
        let {email,password} = req.body
        // basic checks if credentials are valid
        let user = await User.findOne({email}) 
        if (!user){
            return res.status(400).json({message:"euser does not exist !"})
        }

        // compare password
        const isMatch = bcrypt.compare(password,user.password)
        if (!isMatch){
            return res.status(400).json({message:"incorrrect password"})
        }     
        console.log(user);
        
        // create token
        let token = genToken(user._id)
        console.log("token check");
        // put token into cookie
        res.cookie("token",token,{
            httpOnly : true,
            maxAge : 7*24*60*60*1000,
            sameSite : "strict",
            secure : process.env.NODE_ENVIRONMENT==="production"
        })
        // return response
        return res.status(200).json(user)
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message:"login error"})
    }
}

export const logout = async (req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"logged out successfully"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"logout error"})
    }
}

