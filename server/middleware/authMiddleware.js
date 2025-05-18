import { parse } from "dotenv";
import jwt from "jsonwebtoken";
import pool from "../config/db.js"; // Make sure this import is present

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyimpan data user ke dalam request
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export const checkCompanyRole = (req, res, next) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: "Forbidden: Only company allowed." });
  }
  next();
};

export const checkCompanyOwnerOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyId = parseInt(req.params.id || req.body.company_id);
    
    if (!companyId || isNaN(companyId)) {
      return res.status(400).json({ message: "Valid company ID is required." });
    }
    
    // First check if user is the company owner
    const companyCheck = await pool.query(
      `SELECT * FROM companies WHERE id = $1 AND user_id = $2`,
      [companyId, userId]
    );
    
    if (companyCheck.rows.length > 0) {
      // User is the company owner, proceed
      return next();
    }
    
    // If not owner, check if user is an admin
    const adminCheck = await pool.query(
      `SELECT * FROM company_admin WHERE company_id = $1 AND user_id = $2`,
      [companyId, userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ 
        message: "Access denied. You are not an owner or admin for this company." 
      });
    }
    
    // User is an admin for this company, proceed
    next();
  } catch (error) {
    console.error("Error checking company permissions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// New middleware to automatically get company_id for the user
export const getCompanyIdForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find company associated with this user
    const companyResult = await pool.query(
      `SELECT id FROM companies WHERE user_id = $1`,
      [userId]
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ 
        message: "No company profile found for this user. Please create a company profile first.",
        missingCompanyProfile: true
      });
    }
    
    // Add company_id to request body
    req.body.company_id = companyResult.rows[0].id;
    next();
  } catch (error) {
    console.error("Error getting company ID for user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};