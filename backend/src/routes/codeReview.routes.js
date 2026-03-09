import express from "express"
import { reviewCodeController } from "../controllers/codeReview.controller"

const codeReviewRouter = express.Router()

codeReviewRouter.post("/review", reviewCodeController)

export default codeReviewRouter