import express from "express";

const UserRoute = express.Router();
import { IsLoggedIn, IsAdmin } from "../middlewares/auth.middleware.js";
import {
  GetAllUsers,
  GetUserProfile,
  RegisterUser,
  LoginUser,
  LogoutUser,
  DeleteUser,
  UpdateUser,
} from "../controllers/user.controller.js";
import { userUpload } from "../middlewares/upload.middleware.js";

// admin only
UserRoute.get("/all", IsLoggedIn, IsAdmin, GetAllUsers);

// public only
UserRoute.get("/profile/:userId", IsLoggedIn, GetUserProfile);
UserRoute.post("/register", userUpload.single("profileImage"), RegisterUser);
UserRoute.post("/login", LoginUser);
UserRoute.post("/logout", IsLoggedIn, LogoutUser);
UserRoute.delete("/:userId", IsLoggedIn,  DeleteUser);
UserRoute.post(
  "/update/:userId",
  IsLoggedIn,
  userUpload.single("profileImage"),
  UpdateUser,
);

// TODO: upcoming routes
// UserRoute.post("/forgotPassword", IsLoggedIn, ForgotPassword)

export default UserRoute;
