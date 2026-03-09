import InterviewSession from "../models/interviewSession.model.js";
import { generateQuestionsFromAI, continueInterviewWithAI } from "../providers/ai.provider.js";
import { selectNextTopic } from "../utils/topicSelector.js";
import { calculateDifficulty } from "../utils/difficultyEngine.js";
import { validateAIResponse } from "../utils/aiResponseValidator.js";

const MAX_QUESTIONS = 10;
const MAX_DURATION_MINUTES = 20;
const MAX_CONTEXT_MESSAGES = 10;

export const generateQuestionService = async (sessionId) => {
    if(!sessionId){
        throw new Error("Session ID is required")
    }

    const session = await InterviewSession.findById(sessionId)
    if(!session){
        throw new Error("Session not found")
    }

    const {question, topic, type} = await generateQuestionsFromAI(session.jobRole)

    session.messages.push({
        role:"interviewer",
        content:question,
        type:type,
        topic:topic,
        score:null
    })

    session.questionCount += 1
    if(type === "coding"){
        session.codingQuestionsAsked +=1
    }
    if(topic && !session.topicsCovered.includes(topic)){
        session.topicsCovered.push(topic)
    }
    await session.save()
    return question
}

export const createInterviewSessionService = async (jobRole)=>{
    if(!jobRole || !jobRole.trim()){
        throw new Error("Job role is required")
    }

    const session = await InterviewSession.create({
        jobRole: jobRole.trim()
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

    if(session.status==="completed"){
        throw new Error("Interview session is already completed")
    }

    const interviewDuration = (Date.now()- new Date(session.startTime).getTime())/60000
    if(session.questionCount >= MAX_QUESTIONS || interviewDuration >= MAX_DURATION_MINUTES){
        session.status = "completed"
        await session.save()

        return{
            interviewCompleted:true,
            finalScore: session.totalScore,
            totalQuestions: session.questionCount,
        }
    }
    const questionCount = session.questionCount
    
    session.difficultyLevel = calculateDifficulty(session.scores)

    const recentMessages = session.messages.slice(-MAX_CONTEXT_MESSAGES)
    const conversation = recentMessages.map(msg=>({
        role:msg.role === "interviewer" ? "assistant" : "user",
        content:msg.content
    }))

    const suggestedTopic = selectNextTopic(session.jobRole, session.topicsCovered)   

    const rawResponse = await continueInterviewWithAI(conversation, session.jobRole, session.difficultyLevel, session.topicsCovered, suggestedTopic)

    const parsed = await validateAIResponse(rawResponse)

    const {score, evaluation, decision, nextQuestion, questionType, topic} = parsed

    session.currentQuestionType = questionType

    let finalTopic = topic
    if(decision === "move_topic"){
        finalTopic = suggestedTopic
    }
    if(decision === "followup"){
        finalTopic = session.currentTopic || topic
    }
    if(decision === "coding_question"){
        finalTopic = topic || session.currentTopic
    }
    session.currentTopic = finalTopic

    const normalizedTopic = finalTopic ? finalTopic.toLowerCase() : null
    if(normalizedTopic && !session.topicsCovered.includes(normalizedTopic)){
        session.topicsCovered.push(normalizedTopic)
    }

    session.scores.push(score)
    session.totalScore += score
    session.questionCount += 1
    if(questionType === "coding"){
        session.codingQuestionsAsked +=1
    }

    session.messages.push({
        role:"interviewer",
        content:nextQuestion,
        type:questionType,
        topic:finalTopic,
        score:score
    })

    await session.save()
    return {
        interviewCompleted:false,
        score,
        evaluation,
        decision,
        nextQuestion,
        questionType
    }
}

