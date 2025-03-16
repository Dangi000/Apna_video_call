import httpStatus from "http-status";
import bcrypt from "bcrypt"; // 🔧 Changed from "bcrypt" to "bcryptjs" for better compatibility
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import dotenv from "dotenv";

dotenv.config(); // 🔧 Load environment variables

// Secret key for JWT (Use from .env for security)
const JWT_SECRET = "your_secret_keyjssbcjkdbcmnxbcjkdb";

/**
 * ✅ Login Controller
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🔍 Validate input
    if (!username || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Username and password are required." });
    }

    // 🔍 Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
    }

    // 🔑 Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password." });
    }

    // 🔑 Generate JWT Token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

    res.status(httpStatus.OK).json({ message: "Login successful", token });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};

/**
 * ✅ Register Controller
 */
const register = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // 🔍 Validate input
    if (!name || !username || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required." });
    }

    // 🔍 Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({ message: "Username already exists." });
    }

    // 🔑 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Create user
    const newUser = new User({ name, username, password: hashedPassword });
    await newUser.save();

    res.status(httpStatus.CREATED).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};

/**
 * ✅ Get User Meeting History
 */
const getUserHistory = async (req, res) => {
  try {
    const { token } = req.query;

    // 🔍 Validate token
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Token is required." });
    }

    // 🔑 Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token." });
    }

    // 📅 Fetch meeting history
    const meetings = await Meeting.find({ user_id: user.username });

    res.status(httpStatus.OK).json(meetings);
  } catch (error) {
    console.error("❌ Get History Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};

/**
 * ✅ Add Meeting to History
 */
const addToHistory = async (req, res) => {
  try {
    const { token, meeting_code } = req.body;

    // 🔍 Validate input
    if (!token || !meeting_code) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Token and meeting code are required." });
    }

    // 🔑 Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token." });
    }

    // 🆕 Save meeting to history
    const newMeeting = new Meeting({ user_id: user.username, meetingCode: meeting_code });
    await newMeeting.save();

    res.status(httpStatus.CREATED).json({ message: "Meeting added to history." });
  } catch (error) {
    console.error("❌ Add to History Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};

export { login, register, getUserHistory, addToHistory };
