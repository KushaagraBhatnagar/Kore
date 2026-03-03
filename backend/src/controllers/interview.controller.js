import { createInterviewSessionService } from "../services/interview.service.js";
import asyncHandler from "../utils/async-handler.js";

const createSession = asyncHandler (async(req, res) => {
    const {jobRole} = req.body

    const session = await createInterviewSessionService(jobRole)

    res.status(201).json({
        success:true,
        data:session
    })
})

export default createSession