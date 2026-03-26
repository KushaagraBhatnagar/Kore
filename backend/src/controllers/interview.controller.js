import { getAnswerService, createInterviewSessionService, continueInterviewService } from "../services/interview.service.js";
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
        question,
        questionType: question.type,
        questionTopic: question.topic
    })
})

export const checkAnswer = asyncHandler (async(req,res)=>{
    const {sessionId, answer} = req.body
    const evaluation = await getAnswerService(sessionId,answer)
    res.status(200).json({
        success:true,
        evaluation 
    })
})

export const continueInterview = asyncHandler (async(req,res)=>{
    const {sessionId} = req.body
    const io = req.app.get("io")
    const result = await continueInterviewService(sessionId, io)

    if(result.interviewCompleted){
        return res.status(200).json({
            success:true,
            interviewCompleted:true,
            finalScore: result.finalScore,
            totalQuestions: result.totalQuestions
        })
    }

    res.status(200).json({
        success:true,
        interviewCompleted:false,
        score: result.score,
        evaluation: result.evaluation,
        nextQuestion: result.nextQuestion,
        questionType:result.questionType
    })
})

export default createSession