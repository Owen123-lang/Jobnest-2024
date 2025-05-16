import express from "express";
import {
    createFavorite,
    getUserFavorites,
    checkFavorite,
    deleteFavoriteByFavoriteId,
    deleteFavoriteByJobId
} from "../controllers/favoritesController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// cretate a mennew favorite
router.post("/create", verifyToken, createFavorite);

// get all favorites for current user
router.get("/user", verifyToken, getUserFavorites);

// check if a job is favorited by current user
router.get("/check/:job_id", verifyToken, checkFavorite);

// delete a favorite (remove from saved jobs)
router.delete("/delete/:id", verifyToken, deleteFavoriteByFavoriteId);

// Delete by job ID
router.delete("/job/:jobId", deleteFavoriteByJobId);


export default router;