import { Router } from "express";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
const router = Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.jWT_SECRET, { expiresIn: "1d" });
};

router.post("/register", async (req, res) => {
  // res.send("register");
  try {
    const { username, email, password } = req.body;
    if ((!username, !email, !password)) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "The password needs to be at least 6 characters long." });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ msg: "The username needs to be at least 3 characters long." });
    }

    //check if user already exists

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ msg: "User already exists." });
    }
    const existingUserName = await User.findOne({ username: username });
    if (existingUserName) {
      return res.status(400).json({ msg: "User already exists." });
    }

    //get a random avatar
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const user = new User({
      username,
      email,
      password,
      profileImage,
    });

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in register route", error);
    return res.status(500).json({ msg: "Internal server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }
    const user = await User.findOne({ email: email });

    //check if user exists
    if (!user) {
      return res.status(400).json({ msg: "Inavalid crendentials" });
    }

    //compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    //generate the token
    const token = generateToken(user._id);
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in login route", error);
    return res.status(500).json({ msg: "Internal server Error" });
  }
});

export default router;
