import mongoose from "../utils/mongoose.util.js";
import UserModel from "../models/user.model.js";
import { DB_URL } from "../configs/database.config.js";
import bcrypt from "bcrypt";

try {
  await mongoose.connect(DB_URL);
} catch (error) {
  console.log(`Error while connecting to database ${error.message}`);
}

const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || "", 10);

try {
  await UserModel.create({
    username: process.env.ADMIN_USERNAME || "",
    email: process.env.ADMIN_EMAIL ||  "",
    password: hashed,
    role: "admin",
  });
  console.log("admin created ");
} catch (error) {
  console.log(`Error while creating admin ${error.message}`);
}

process.exit();
