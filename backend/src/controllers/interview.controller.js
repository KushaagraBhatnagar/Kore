import { createInterviewSessionService } from "../services/interview.service.js";
import asyncHandler from "../utils/async-handler.js";
import { generateQuestionService } from "../services/interview.service.js";

const createSession = asyncHandler (async(req, res) => {
    const {jobRole} = req.body

    const session = await createInterviewSessionService(jobRole)

    res.status(201).json({
        success:true,
        data:session
    })
})

export const generateQuestion = asyncHandler (async(req,res)=>{
    const {sessionId} = req.body
    const question = await generateQuestionService(sessionId)
    res.status(200).json({
        success:true,
        question
    })
})

export default createSession