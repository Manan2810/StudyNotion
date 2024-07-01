const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User")

// authentication 

exports.auth=(req,res,next)=>{ //next helps to go to the next middleware.
    try{
        // extract jwt token
        const token = req.body.token||req.cookies.token||req.header("Authorization").replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing"
            })
        }

        // verify the token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        }catch(error){
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            })
        }

        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'something went wrong',
        })
    }

}

// Authorization

// isStudent
exports.isStudent=(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for students",
            })
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified",
        });
    }
}
// isInstructor
exports.isInstructor=(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for instructors",
            })
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified",
        });
    }
}
// isAdmin
exports.isAdmin=(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for admin",
            })
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified",
        });
    }
}