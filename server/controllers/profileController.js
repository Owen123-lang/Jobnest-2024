import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Create new profile
export const createProfile = async (req, res) => {
    const userId = req.user.id; // Get from JWT token
    const { full_name, phone, birth_date, bio } = req.body;

    // profile picture come from file upload middleware
    const profile_picture = req.body.profile_picture || null;

    try {
        // Check if profile already exists
        const existingProfile = await pool.query(
            "SELECT * FROM profiles WHERE user_id = $1",
            [userId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({ 
                message: "Profile already exists. Use update endpoint instead." 
            });
        }

        // Create new profile
        const result = await pool.query(
            `INSERT INTO profiles 
            (user_id, full_name, phone, birth_date, bio, profile_picture)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [userId, full_name, phone, birth_date, bio, profile_picture]
        );
        
        res.status(201).json({
            message: "Profile created successfully.",
            profile: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update existing profile with partial updates
export const updateProfile = async (req, res) => {
    const userId = req.user.id; // Get from JWT token
    const updates = req.body; // Get all fields from request body
    
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            message: "No fields provided for update"
        });
    }

    try {
        // Check if profile exists and get current values
        const existingProfile = await pool.query(
            "SELECT * FROM profiles WHERE user_id = $1",
            [userId]
        );

        if (existingProfile.rows.length === 0) {
            return res.status(404).json({ 
                message: "Profile not found. Create a profile first." 
            });
        }
        
        const currentProfile = existingProfile.rows[0];
        
        // Prepare update query parts
        const fields = [];
        const values = [];
        let paramCount = 1;
        
        // For each field in the request, add it to the update query
        if (updates.full_name !== undefined) {
            fields.push(`full_name = $${paramCount}`);
            values.push(updates.full_name);
            paramCount++;
        }
        
        if (updates.phone !== undefined) {
            fields.push(`phone = $${paramCount}`);
            values.push(updates.phone);
            paramCount++;
        }
        
        if (updates.birth_date !== undefined) {
            fields.push(`birth_date = $${paramCount}`);
            values.push(updates.birth_date);
            paramCount++;
        }
        
        if (updates.bio !== undefined) {
            fields.push(`bio = $${paramCount}`);
            values.push(updates.bio);
            paramCount++;
        }
        
        if (updates.profile_picture !== undefined) {
            fields.push(`profile_picture = $${paramCount}`);
            values.push(updates.profile_picture);
            paramCount++;
        }
        
        // Add user_id as the last parameter
        values.push(userId);
        
        // Construct and execute the update query
        const query = `
            UPDATE profiles 
            SET ${fields.join(", ")}
            WHERE user_id = $${paramCount}
            RETURNING *
        `;
        
        const result = await pool.query(query, values);
        
        res.status(200).json({
            message: "Profile updated successfully.",
            profile: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get profile by user ID
export const getProfileByUserId = async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Valid user ID is required" });
  }
  
  try {
    const result = await pool.query(
      `SELECT p.*, u.email, u.role, u.created_at 
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Remove sensitive information
    const profile = result.rows[0];
    delete profile.password;
    
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get my profile
export const getMyProfile = async (req, res) => {
    const userId = req.user.id; // Get from JWT token

    try {
        // First check if profile exists
        const profileResult = await pool.query(
            `SELECT p.*, u.email, u.role, u.created_at
            FROM profiles p
            RIGHT JOIN users u ON p.user_id = u.id
            WHERE u.id = $1`,
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const userData = profileResult.rows[0];

        // If profile does not exist, return user data only
        if (!userData.id) {
            return res.status(200).json({
                user: {
                    id: userId,
                    email: userData.email,
                    role: userData.role,
                    create_at: userData.created_at
                },
                profile: null,
                message: "Profile not created yet."
            });
        }

        // Remove sensitive information
        delete userData.password;

        res.status(200).json({
            user: {
                id: userId,
                email: userData.email,
                role: userData.role,
                create_at: userData.created_at
            },
            profile: {
                id: userData.id,
                full_name: userData.full_name,
                phone: userData.phone,
                birth_date: userData.birth_date,
                bio: userData.bio,
                profile_picture: userData.profile_picture
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

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

// Get all profiles
export const getAllProfiles = async (req, res) => {
    try {
        //Optional pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 

        // Get profile with user data
        const profilesResult = await pool.query(
            `SELECT p.* u.email, u.role, u.created_at
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.id
            LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        // Count total profiles for pagination
        const countResult = await pool.query(`SELECT COUNT(*) FROM profiles`);

        const totalProfiles = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalProfiles / limit);

        // Remove sensitive information
        const profiles = profilesResult.rows.map(profile => {
            const { password, ...rest } = profile;
            return rest;
        });

        res.status(200).json({
            message: "Profiles retrieved successfully.",
            count: profiles.length,
            totalProfiles,
            currentPage: page,
            totalPages,
            profiles
        });
    } catch (error) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}