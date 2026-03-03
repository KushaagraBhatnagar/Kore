import InterviewSession from "../models/interviewSession.model.js";
import asyncHandler from "../utils/async-handler.js";

const createSession = asyncHandler (async(req, res) => {
    const {jobRole} = req.body

    const session = await InterviewSession.create({
        jobRole,
        questions:[],
        answers:[],
        scores:[]
    })

    res.status(201).json({
        success:true,
        data:session
    })
})

export default createSession