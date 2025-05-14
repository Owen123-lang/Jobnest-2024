import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// === REGISTER ===
export const registerUser = async (req, res) => {
  const {email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default role is 'user' if not specified
    const userRole = role === 'company' ? 'company' : 'user';

    const newUser = await pool.query(
      "INSERT INTO users (email, password, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, role, created_at",
      [email, hashedPassword, userRole]
    );

    res.status(201).json({
      message: "User registered successfully.",
      user: newUser.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// === LOGIN ===
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Update last_login timestamp
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// === GET ALL USERS ===
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, role, created_at, last_login FROM users ORDER BY id");

    res.status(200).json({
      message: "Users retrieved successfully.",
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get my profile (authenticated user)
export const getMyProfile = async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Valid user ID is required." });
  }

  
}


// Delete profile
export const deleteProfile = async (req, res) => {
  const userId = req.user.id; // Get from JWT token
  
  try {
    const result = await pool.query(
      "DELETE FROM profiles WHERE user_id = $1 RETURNING *",
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.status(200).json({
      message: "Profile deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};