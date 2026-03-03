import InterviewSession from "../models/interviewSession.model.js";
import { generateQuestionsFromAI } from "../providers/ai.provider.js";

export const generateQuestionService = async (sessionId) => {
    if(!sessionId){
        throw new Error("Session ID is required")
    }

    const session = await InterviewSession.findById(sessionId)
    if(!session){
        throw new Error("Session not found")
    }

    const question = await generateQuestionsFromAI(session.jobRole)

    session.questions.push(question)
    await session.save()
    return question
}

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