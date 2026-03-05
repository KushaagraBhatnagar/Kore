import asyncHandler from "../utils/async-handler.js";
import { generateInterviewReportService } from "../services/interview.analytics.service.js";

export const generateInterviewReport = asyncHandler (async(req,res)=>{
    const {sessionId} = req.params

    const report = await generateInterviewReportService(sessionId)

    res.status(200).json({
        success:true,
        report
    })
})