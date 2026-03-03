import InterviewSession from "../models/interviewSession.model.js";

export const createInterviewSessionService = async (jobRole)=>{
    if(!jobRole){
        throw new Error("Job role is required")
    }

    const session = await InterviewSession.create({
        jobRole,
        questions:[],
        answers:[],
        scores:[],
        totalScore:0
    })

    return session
}