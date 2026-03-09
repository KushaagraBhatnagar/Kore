import asyncHandler from "../utils/async-handler";
import { reviewCodeService } from "../services/codeReview.service";

export const reviewCodeController = asyncHandler(async(req,res)=>{
    const {sessionId, code, language} = req.body
    const review = await reviewCodeService(sessionId, code, language)
    res.status(200).json({
        success: true,
        review
    })
})