import "../configs/env.config.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const SECRET = process.env.JW_SECRET || process.env.JWT_SECRET;

export function GenerateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    SECRET,
    { expiresIn: "2h" },
  );
}

export function VerifyToken(token) {
  if (!token) {
    console.log("No token is provided", token);
  }
  if (!SECRET) {
    throw new Error("JWT secret is missing. Set JW_SECRET in your .env file.");
  }
  // console.log("Token Provided, verifying...", token);
  // console.log("The Secret: ", SECRET);
  return jwt.verify(token, SECRET);
  
}
export async function IsLoggedIn(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No Token Provided",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token Provided",
    });
  }

  try {
    const currentUser = await AuthenticateToken(token);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = currentUser; // now the full, fresh user document, not just the decoded payload
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    console.log("Logged in verification failed: ", error);
    return res.status(401).json({
      success: false,
      message: "No Token Provided",
    });
  }
}


export const IsAdmin = function (req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: " Access Denied admins only",
    });
  }
  next();
};

// auth.util.js
export async function AuthenticateToken(token) {
  const decoded = VerifyToken(token); // throws on invalid/expired
  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser || currentUser.tokenVersion !== decoded.tokenVersion) {
    return null;
  }
  return currentUser;
}

export default {
  GenerateToken,
  VerifyToken,
  IsLoggedIn,
  IsAdmin,
  AuthenticateToken,
};
