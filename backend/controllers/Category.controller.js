const Category = require("../models/Category")

exports.createCategory = async (req,res) => {
    try {
        // fetching data from body
        const {name,description} = req.body;

        // validation
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All the enteries are required",
            })
        }

        // create entry in dp
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        })
        console.log(categoryDetails);

        // return the response
        return res.status(200).json({
            success:true,
            message:"Category created successfully"
        })
    } 
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// diplay all category handlers
exports.showAllCategory = async (req,res) => {
    try{
        const allCategories = await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"all tags returned successfully",
            allCategories
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}