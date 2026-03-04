import InterviewSession from "../models/interviewSession.model.js";
import { generateQuestionsFromAI, continueInterviewWithAI } from "../providers/ai.provider.js";

export const generateQuestionService = async (sessionId) => {
    if(!sessionId){
        throw new Error("Session ID is required")
    }

    const session = await InterviewSession.findById(sessionId)
    if(!session){
        throw new Error("Session not found")
    }

    const question = await generateQuestionsFromAI(session.jobRole)

    session.messages.push({
        role:"interviewer",
        content:question,
        type:"concept"
    })
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

export const getAnswerService = async (sessionId,answer)=>{
    if(!sessionId || !answer){
        throw new Error("Session ID and answer are required")
    }
    
    const session = await InterviewSession.findById(sessionId)

    if(!session){
        throw new Error("Session not found")
    }

    session.messages.push({
        role:"candidate",
        content:answer
    })

    await session.save()
    return{
        message: "Candidate answer stored successfully"
    };
}

export const continueInterviewService = async (sessionId) => {
    if(!sessionId){
        throw new Error("Session ID is required")
    }

    const session = await InterviewSession.findById(sessionId)
    if(!session){
        throw new Error("Session not found")
    }

    const questionCount = session.messages.filter(msg=>msg.role === "interviewer").length
    let difficultyLevel = "warmup";

    if(questionCount >= 3) difficultyLevel = "core"
    if(questionCount >= 6) difficultyLevel = "advanced"
    if(questionCount >= 9) difficultyLevel = "challenge"

    session.difficultyLevel = difficultyLevel

    const conversation = session.messages.map(msg=>({
        role:msg.role === "interviewer" ? "assistant" : "user",
        content:msg.content
    }))

    const rawResponse = await continueInterviewWithAI(conversation, session.jobRole, session.difficultyLevel)

    let parsed;

    try{
        const cleaned = rawResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()
        parsed = JSON.parse(cleaned)
    }
    catch(err){
        throw new Error("AI returned invalid JSON: " + err.message)
    }

    const {score, evaluation, nextQuestion, questionType} = parsed

    if(typeof score !== "number"){
        throw new Error("Invalid score returned by AI")
    }

    session.scores.push(score)
    session.totalScore += score
    session.messages.push({
        role:"interviewer",
        content:nextQuestion,
        type:questionType
    })

    await session.save()
    return {
        score,
        evaluation,
        nextQuestion,
        questionType
    }
}

