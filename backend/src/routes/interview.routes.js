import express from "express"
import createSession, { checkAnswer, generateQuestion, continueInterview } from "../controllers/interview.controller.js"
import { generateInterviewReport } from "../controllers/interview.analytics.controller.js"
import { aiRateLimiter } from "../middlewares/rateLimiter.middleware.js"
const router = express.Router()

router.post("/create",createSession)
router.post("/generate-question",aiRateLimiter,generateQuestion)
router.post("/submit-answer",aiRateLimiter, checkAnswer);
router.post("/continue-interview", aiRateLimiter, continueInterview);
router.get("/report/:sessionId", generateInterviewReport)
export default router