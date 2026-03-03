import express from "express"
import createSession from "../controllers/interview.controller.js"

const router = express.Router()

router.post("/create",createSession)

export default router