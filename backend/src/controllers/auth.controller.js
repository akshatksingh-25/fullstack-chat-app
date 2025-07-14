import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"


export const signup = async (req, res) => {
    const {fullName,email,password} = req.body
  try{
    //hash password-So that user knows that they are authenticated.we installed a package for this bcryptjs.

    if(!fullName || !email || !password){
        return res.status(400).json({ message : "All fields are required" });
    }

    if(password.length<6){
        return res.status(400).json({ message : "Password must be atleast 6 characters" });
    }

    const user = await User.findOne({email})

    if(user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = new User({
        fullName : fullName,
        email:email,
        password:hashedPassword
    })

    if(newUser){
        // generate jwt token here
        generateToken(newUser._id,res);
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });

    }else{
        res.status(400).json({ message: "Invalid User data" });
    }


  }catch(error){
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}






export const login = async (req, res) => {
  const {email,password} = req.body

  try{
    const user = await User.findOne({email})

    if(!user){
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password,user.password)
    if(!isPasswordCorrect){
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate jwt token here
      generateToken(user._id,res);

      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });

      // ✅ Yes, res is sending the cookie back to the client along with the JSON data in one single HTTP response.

  }catch(error){
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}






export const logout = (req, res) => {
  try{
    res.cookie("jwt", "" , {maxAge:0}) // We cleared our cookie jwt by "" and set maxAge to 0.
    res.status(200).json({ message: "Logged out successfully" });
  }catch(error){
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




export const updateProfile = async(req,res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id

    if(!profilePic){
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic)

    //cloudinary is not our database. we have uploaded image there. it's just a bucket to our images.
    // we need to update profile pic in database for our user.

    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic : uploadResponse.secure_url} ,{ new:true})
    //By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true, findOneAndUpdate() will instead give you the object after update was applied.

    res.status(200).json(updatedUser);

  } catch (error) {
    console.log("Error in update profile", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




export const checkAuth = (req,res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}