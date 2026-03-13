import asyncHandler from "../utils/async-handler.js";
import InterviewSession from "../models/interviewSession.model.js";

export const getSession = asyncHandler (async(req,res)=>{
    const {sessionId} = req.params
    const session = await InterviewSession.findById(sessionId)
    if(!session){
        return res.status(404).json({
            success:false,
            message:"Session not found"
        })
    }   
    return res.status(200).json({
        success:true,
        session
    })

})