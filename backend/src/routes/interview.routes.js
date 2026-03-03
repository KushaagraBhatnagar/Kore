import express from "express"
import createSession, { generateQuestion } from "../controllers/interview.controller.js"

const router = express.Router()

router.post("/create",createSession)
router.post("/generate-question",generateQuestion)
export default router