import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile) //.put method is used because you’re updating something

// Middlewares and handler: protectRoute, updateProfile
// This part protectRoute, updateProfile means you are passing two functions in sequence:

// (a) protectRoute
// This is a middleware function.
// It runs before the main controller (updateProfile).
// Its job is usually to:
// Authenticate the user,
// Check if a valid token exists,
// Attach user data to req.user if authenticated
// If authentication fails, it sends an error response and does not call next middleware.

// (b) updateProfile
// This is your controller function (route handler).
// It runs only if protectRoute allows (i.e. user is authenticated).
// Its job is to:
// Receive the request to update user profile,
// Validate and update data in the database,
// Send back an updated profile response.


router.get("/check", protectRoute, checkAuth);
// We are going to use this function to check whether user is authenticated. if we refresh our page then depending on it, this will take us to either login or profile page.



export default router;
