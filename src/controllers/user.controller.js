import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import ShopModel from "../models/shop.model.js";
import ProductModel from "../models/product.model.js";
import ValidateUserRegisration from "../validators/user.validator.js";
import { GenerateToken } from "../middlewares/auth.middleware.js";
import { publicPathFor } from "../middlewares/upload.middleware.js";

export async function GetAllUsers(req, res) {
  try {
    // return all users without their passwords
    const users = await UserModel.find()
      .select("-password -__v -role")
      .sort({ createdAt: -1 });
    if (!users || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No users found at all",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.log("Error while getting all users", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function GetUserProfile(req, res) {
  try {
    const { userId } = req.params;

    const ExistingUser = await UserModel.findOne({ _id: userId }).populate(
      "shop",
      "name description owner",
    );
    if (!ExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found with given id ",
      });
    }
    console.log("Existing user: ", ExistingUser);

    return res.status(200).json({
      success: true,
      user: {
        id: ExistingUser._id,
        username: ExistingUser.username,
        email: ExistingUser.email,
        role: ExistingUser.role,
        phone: ExistingUser.phone,
        address: ExistingUser.address,
        profileImage: ExistingUser.profileImage,
        shop: ExistingUser.shop,
      },
    });
  } catch (error) {
    console.log("Error occured while getting user profile: ", error);
  }
}

export async function RegisterUser(req, res) {
  console.log("Registering user: ");
  try {
    const { username, email, password, phone, address } = req.body;
    const profileImage = req.file
      ? publicPathFor("users", req.file)
      : undefined;

    const validation = ValidateUserRegisration(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.errors.join(", "),
      });
    }
    const ExistingEmail = await UserModel.findOne({ email });
    if (ExistingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    const ExistingUsername = await UserModel.findOne({ username });
    if (ExistingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }
    const HashedPassword = await bcrypt.hash(password, 10);
    const User = await UserModel.create({
      username,
      email,
      password: HashedPassword,
      ...(phone ? { phone } : {}),
      ...(address ? { address } : {}),
      ...(profileImage ? { profileImage } : {}),
    });
    console.log(User);
    const Token = GenerateToken(User);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      bearerToken: Token,
      user: {
        id: User._id,
        username: User.username,
        email: User.email,
        role: User.role,
      },
    });
  } catch (error) {
    console.log("Error registering a user", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while registering the user",
      error: error.message,
    });
  }
}

export async function LoginUser(req, res) {
  console.log("Logging user; ..");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await UserModel.findOne({ email }).populate(
      "shop",
      "name description owner",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const Token = GenerateToken(user); // this is the string to send to the client
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      bearerToken: Token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        shop: user.shop,
      },
    });
  } catch (error) {
    console.log("Error logging in", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while logging in",
    });
  }
}
// UserModel: add a field
// tokenVersion: { type: Number, default: 0 }

export async function LogoutUser(req, res) {
  try {
    // req.user should already be set by your auth middleware (user is logged in)
    await UserModel.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 },
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error logging out: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Error logging out" });
  }
}

export async function UpdateUser(req, res) {
  try {
    // TODO: email update is not allowed for now, but we can implement it later with email confirmation.
    const { userId } = req.params;
    // TODO: implement password reset
    const { username, phone, address } = req.body; // read from body, not params
    const profileImage = req.file
      ? publicPathFor("users", req.file)
      : undefined;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not found",
      });
    }
    // define update object
    const update = {};

    if (username !== undefined) update.username = username;
    // if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (profileImage !== undefined) update.profileImage = profileImage;

    const updated_user = await UserModel.findByIdAndUpdate(userId, update, {
      returnDocument: "after",
    }).select("-password -__v").populate("shop", "name description owner");

    // return plain fields so frontend can read .id reliably
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updated_user._id,
        username: updated_user.username,
        phone: updated_user.phone,
        email: updated_user.email,
        role: updated_user.role,
        profileImage: updated_user.profileImage,
        address: updated_user.address,
        shop: updated_user.shop,
      },
    });
  } catch (error) {
    console.log("Error occurred while updating user info: ", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating user",
      error: error.message,
    });
  }
}

export async function DeleteUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User with given id not found!",
      });
    }
    await UserModel.findOneAndDelete({ _id: userId });
    // we need to delete shops and products related to the user also not just the account
    await ShopModel.deleteMany({ owner: userId });
    await ProductModel.deleteMany({ owner: userId });
    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.log("Error Deleting user: ", error);
    return res.status(500).json({
      success: false,
      message: "An Error occurred while deleting user.",
      error: error.message,
    });
  }
}

// export async function ForgotPassword(req, res){}
