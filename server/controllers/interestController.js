import pool from "../config/db.js"

// Create Interst
export const createInterest = async (req, res) => {
    const user_id = req.user.id; // Get from JWT token
    const { interest_area } = req.body;

    if (!interest_area) {
        return res.status(400).json({
            message: "Interest area is required."
        });
    }

    try {

        const existingInterest = await pool.query(
            `SELECT * FROM interests WHERE user_id = $1 AND interest_area = $2`,
            [user_id, interest_area]
        );

        if(existingInterest.rows.length > 0) {
            return res.status(400).json({
                message: "Interest already exists."
            });
        }

        // Create interest in the database
        const result = await pool.query(`INSERT INTO interests (user_id, interest_area)
        VALUES ($1, $2) RETURNING *`, [user_id, interest_area]);
        res.status(201).json({
            message: "Interest created successfully",
            interest: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating interest:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Get all interests for current user
export const getMyInterest = async (req, res) => {
    const user_id = req.user.id; // Get from JWT token

    try {
        const result = await pool.query(
            `SELECT * FROM interests WHERE user_id = $1`, [user_id]
        )

        res.status(200).json({
            count: result.rows.length,
            interests: result.rows
        })
    } catch (error) {
        console.error("Error fetching interests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get interest for a specific user
export const getUserInterest = async (req, res) => {
    const user_id = req.body.user_id;

    if (!user_id) {
        return res.status(400).json({
            message: "User ID is required."
        });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM interests WHERE user_id = $1`, [user_id]
        )

        res.status(200).json({
            count: result.rows.length,
            interests: result.rows
        })
    } catch (error) {
        console.error("Error fetching interests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Update an interest
export const updateInterest = async (req, res) => {
  const userId = req.user.id; // Get from JWT token
  const interestId = parseInt(req.params.id);
  const { interest_area } = req.body;
  
  if (!interestId || isNaN(interestId)) {
    return res.status(400).json({ message: "Valid interest ID is required" });
  }
  
  if (!interest_area) {
    return res.status(400).json({ message: "Interest area is required for update" });
  }
  
  try {
    // Check if interest exists and belongs to the user
    const existingInterest = await pool.query(
      "SELECT * FROM interests WHERE id = $1 AND user_id = $2",
      [interestId, userId]
    );
    
    if (existingInterest.rows.length === 0) {
      return res.status(404).json({ 
        message: "Interest not found or you don't have permission to update it" 
      });
    }
    
    // Check if new interest_area would create a duplicate
    if (interest_area !== existingInterest.rows[0].interest_area) {
      const duplicateCheck = await pool.query(
        "SELECT * FROM interests WHERE user_id = $1 AND interest_area = $2 AND id != $3",
        [userId, interest_area, interestId]
      );
      
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({ 
          message: "You already have another interest with this name" 
        });
      }
    }
    
    // Update the interest
    const result = await pool.query(
      `UPDATE interests
       SET interest_area = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [interest_area, interestId, userId]
    );
    
    res.status(200).json({
      message: "Interest updated successfully",
      interest: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating interest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


// Delete an interest
export const deleteInterest = async (req, res) => {
  const userId = req.user.id; // Get from JWT token
  const interestId = parseInt(req.params.id);
  
  if (!interestId || isNaN(interestId)) {
    return res.status(400).json({ message: "Valid interest ID is required" });
  }
  
  try {
    // Check if interest exists and belongs to the user
    const existingInterest = await pool.query(
      "SELECT * FROM interests WHERE id = $1 AND user_id = $2",
      [interestId, userId]
    );
    
    if (existingInterest.rows.length === 0) {
      return res.status(404).json({ 
        message: "Interest not found or you don't have permission to delete it" 
      });
    }
    
    // Delete the interest
    await pool.query(
      "DELETE FROM interests WHERE id = $1 AND user_id = $2",
      [interestId, userId]
    );
    
    res.status(200).json({
      message: "Interest deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting interest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all interests (admin only)
export const getAllInterests = async (req, res) => {
  try {
    // Optional pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get interests with user info
    const result = await pool.query(
      `SELECT i.*, u.email 
       FROM interests i
       JOIN users u ON i.user_id = u.id
       ORDER BY u.email, i.interest_area
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM interests"
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      count: result.rows.length,
      totalCount,
      currentPage: page,
      totalPages,
      interests: result.rows
    });
  } catch (error) {
    console.error("Error fetching all interests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};