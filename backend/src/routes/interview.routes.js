import express from "express"
import createSession, { checkAnswer, generateQuestion, continueInterview } from "../controllers/interview.controller.js"

const router = express.Router()

router.post("/create",createSession)
router.post("/generate-question",generateQuestion)
router.post("/submit-answer", checkAnswer);
router.post("/continue-interview", continueInterview);
export default router