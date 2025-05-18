import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// === REGISTER ===
export const registerUser = async (req, res) => {
  const {email, password, role, companyName, website, industry, description } = req.body;

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
    
    // Begin transaction
    await pool.query('BEGIN');
    
    try {
      // Create user
      const newUser = await pool.query(
        "INSERT INTO users (email, password, role, created_at, last_login) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email, role, created_at",
        [email, hashedPassword, userRole]
      );

      const user = newUser.rows[0];
      
      // If role is 'company', automatically create a company profile
      if (userRole === 'company') {
        // Use provided company information or set defaults
        const name = companyName || email.split('@')[0]; // Default name from email if not provided
        
        await pool.query(
          `INSERT INTO companies (user_id, name, website, industry, description) 
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, name, website || null, industry || null, description || null]
        );
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      // Generate JWT token for immediate authentication
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(201).json({
        message: "User registered successfully.",
        token, // Return token for immediate login
        user: user
      });
      
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }

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
    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // User not found
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if the user's role is 'company' - this is the fix for company login
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
    // 1. Find user by email - explicitly log what we find for debugging
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // If user not found, return clear message
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Optional role check - just warn rather than blocking login
    // This allows for flexibility if a user has multiple roles or if role is managed differently
    if (user.role !== 'company') {
      console.warn(`User ${email} attempted company login with role: ${user.role}`);
      // We'll still allow login but log warning - you can uncomment below if strict role enforcement is needed
      // return res.status(401).json({ message: "Unauthorized role" });
    }

    // 3. Check password using bcrypt - ensure we're comparing correctly
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Log password match result for debugging
    console.log(`Password match for ${email}: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Update last_login timestamp
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send successful response with token and user info
    res.status(200).json({
      message: "Company login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    // 5. Catch all other errors with better logging
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
