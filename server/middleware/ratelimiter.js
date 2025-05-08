import rateLimit from "express-rate-limit";

export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 3,
  message: {
    status: 429,
    message: "Terlalu banyak upload. Silakan coba lagi nanti."
  }
});
