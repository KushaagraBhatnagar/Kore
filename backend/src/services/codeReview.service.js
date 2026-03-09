import { reviewCodeWithAI } from "../providers/codeReview.provider.js";
import InterviewSession from "../models/interviewSession.model.js";

export const reviewCodeService = async (sessionId, code, language)=>{
    if(!sessionId || !code){
        throw new Error("Session ID and code are required")
    }

    const session = await InterviewSession.findById(sessionId)

    if(!session){
        throw new Error("Session not found")
    }

    const lastQuestion = session.messages
        .filter(msg=>msg.role === "interviewer" && msg.type === "coding")
        .slice(-1)[0]

    if(!lastQuestion){
        throw new Error("No coding question found in the session")
    }

    const question = lastQuestion.content
    const review = await reviewCodeWithAI(question, code, language)

    const score = review.score || 0

    session.scores.push(score)
    session.totalScore += score
    await session.save()

    return review
}