import bcrypt from "bcrypt";
import { genSalt, hash } from "bcrypt";
import { Users } from "./models.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import "dotenv/config";

const ats = process.env.ACCESS_TOKEN_SECRET;

export const signup = async (req, res) => {
  try {
    const { name, email, password, confPassword } = req.body;

    // Validasi input awal
    if (!name.trim()) return res.status(400).json({ error: "Name is required!" });
    if (!email.trim()) return res.status(400).json({ error: "Email is required!" });
    if (!password) return res.status(400).json({ error: "Password is required!" });
    if (!validator.isEmail(email)) return res.status(400).json({ error: "Email is invalid!" });

    const [dupName, dupEmail] = await Promise.all([Users.findOne({ name }), Users.findOne({ email })]);
    if (dupName) return res.status(409).json({ error: "Duplicate name!" });
    if (dupEmail) return res.status(409).json({ error: "Duplicate email!" });

    if (password !== confPassword) return res.status(400).json({ error: "Wrong confirm password!" });

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    req.body.password = hashedPassword;

    if (email === "ahmad@gmail.com") {
      req.body.role = "admin";
    } else req.body.role = "user";

    const newUser = await Users.create(req.body, { new: true });

    res.status(201).json({ message: `Register ${newUser.name} success` });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email) return res.status(400).json({ error: `Email is required!` });
    if (!password) return res.status(400).json({ error: `Password is required!` });

    const existingEmail = await Users.findOne({ email });
    if (!existingEmail) return res.status(401).json({ error: "Incorrect email!" });

    const matchPass = await bcrypt.compare(password, existingEmail.password);
    if (!matchPass) return res.status(401).json({ error: "Incorrect password!" });

    const { _id: id, name, role } = existingEmail;
    const accessToken = jwt.sign({ id, name, role }, ats, { expiresIn: "1d" });
    res.cookie("accessTokenApiMooV3", accessToken, {
      // secure: true,
      // httpOnly: true,
      // // maxAge: 30 * 24 * 60 * 60 * 1000,
      // // sameSite: "lax", //
      // sameSite: "none",
      // path: "/",

      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ message: `Login ${email} success`, accessTokenApiMooV3: accessToken });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const signout = async (req, res) => {
  try {
    const accessToken = req.cookies.accessTokenApiMooV3;
    if (!accessToken) {
      return res.status(200).json({ message: "Already logged out" });
    }

    // Hapus cookie accessTokenV3
    res.clearCookie("accessTokenApiMooV3", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// Get User Data (getMe)
export const getMe = async (req, res) => {
  const { id } = req.user;
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized, missing user data" });

    const user = await Users.findById(id).select(["-__v", "-password"]);
    if (!user) return res.status(403).json({ message: "Forbidden, user not found" });

    res.status(200).json({ message: "User data retrieved successfully", user });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await Users.findById(id).select(["-__v", "-password"]);
    if (!user) return res.status(404).json({ message: "Forbidden, user not found" });

    if (user.role !== "admin" && req.body.role === "admin")
      return res.status(400).json({ message: `user cannot be an admin without admin permission` });

    if (user.email === "ahmad@gmail.com" && req.body.role === "user")
      return res.status(400).json({ message: `You are primary admin you cannot be the user` });

    const { password, confPassword } = req.body;
    if (password) {
      if (password !== confPassword) return res.status.json({ error: `confirm password wrong` });
      const salt = await genSalt(10);
      req.body.password = await hash(password, salt);
    } else {
      req.body.password = user.password;
    }
    await Users.findByIdAndUpdate(user._id, req.body, { new: true });
    res.status(200).json({ message: `Update your account success` });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const user = await Users.findById(id).select(["-__v", "-password"]);
    if (!user) return res.status(404).json({ message: "Forbidden, user not found" });

    if (user.role === "admin")
      return res.status(400).json({ message: `role admin cannot be deleted, change role first` });

    if (user === "ahmad@gmail.com") return res.status(400).json({ message: `The primary admin cannot be deleted` });

    await Users.findByIdAndDelete(user._id);
    res.status(200).json({ message: `Delete your account success` });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
