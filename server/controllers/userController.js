import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// === REGISTER ===
export const registerUser = async (req, res) => {
  const {email, password, role} = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
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
    
    // Begin transaction
    await pool.query('BEGIN');
    
    try {
      // Create user
      const newUser = await pool.query(
        "INSERT INTO users (email, password, role, created_at, last_login) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email, role, created_at",
        [email, hashedPassword, userRole]
      );

      const user = newUser.rows[0];
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Generate JWT token for immediate authentication
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return success response
      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
      
    } catch (error) {
      // Roll back the transaction if anything fails
      await pool.query('ROLLBACK');
      console.error("Transaction error during registration:", error);
      return res.status(500).json({ 
        message: "Error during registration process", 
        error: error.message 
      });
    }

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      message: "Server error during registration", 
      error: error.message 
    });
  }
};

// === LOGIN ===
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // User not found
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if the user's role is 'user' - this endpoint is for regular users
    if (user.role !== 'user') {
      return res.status(401).json({ message: "Unauthorized role. This endpoint is only for regular users." });
    }

    // Verify password matches using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Update last_login timestamp
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    // Generate JWT token with user info
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return token and user info
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// === COMPANY LOGIN ===
export const companyLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // User not found
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if the user's role is 'company' - this endpoint is for company users
    if (user.role !== 'company') {
      return res.status(401).json({ message: "Unauthorized role. This endpoint is only for company users." });
    }

    // Verify password matches using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Update last_login timestamp
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    // Get company info if available
    let companyId = null;
    const companyResult = await pool.query("SELECT id FROM companies WHERE user_id = $1", [user.id]);
    if (companyResult.rows.length > 0) {
      companyId = companyResult.rows[0].id;
    }

    // Generate JWT token with user info
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        company_id: companyId // Include company_id if applicable
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return token and user info
    res.status(200).json({
      message: "Company login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: companyId
      }
    });

  } catch (error) {
    console.error("Company login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
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
