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

    const normalisedTopic = topic ? topic.toLowerCase() : null
    session.currentQuestionType = type
    session.currentTopic = normalisedTopic

    session.messages.push({
        role:"interviewer",
        content:question,
        type:type,
        topic:normalisedTopic,
        score:null
    })



    session.questionCount += 1
    if(type === "coding"){
        session.codingQuestionsAsked +=1
    }
    if(normalisedTopic && !session.topicsCovered.includes(normalisedTopic)){
        session.topicsCovered.push(normalisedTopic)
    }
    await session.save()
    return {
        question,
        topic: normalisedTopic,
        type
    }
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
    if(!sessionId || !answer || !answer.trim()){
        throw new Error("Session ID and answer are required")
    }
    
    const session = await InterviewSession.findById(sessionId)

    if(!session){
        throw new Error("Session not found")
    }

    if(session.status === "completed"){
        throw new Error("Interview session is already completed")
    }

    if(session.currentQuestionType === "coding"){
        throw new Error("Use /api/code/review for coding answers")
    }

    const lastInterviewerMessage = [...session.messages].reverse().find(msg=>msg.role === "interviewer")
    if(!lastInterviewerMessage){
        throw new Error("No question found for this session")
    }

    session.messages.push({
        role:"candidate",
        content:answer.trim(),
        type:lastInterviewerMessage.type || "concept",
        topic:lastInterviewerMessage.topic || null,
        score:null
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

    const lastMessage = session.messages[session.messages.length -1]
    
    const isAfterCodingReview = lastMessage.role === "interviewer" && lastMessage.type === "coding"
    if(!lastMessage || (lastMessage.role !== "candidate" && !isAfterCodingReview)){
        throw new Error("Last message must be a candidate answer or coding review feedback")
    }

    session.difficultyLevel = calculateDifficulty(session.scores)

    const conversation = [
        {
            role:"system",
            content:`You are a senior FAANG-level technical interviewer for the role of ${session.jobRole}. Current difficulty: ${session.difficultyLevel}.`
        }
    ]
    if(session.messages.length>0){
        const pinnedIntro = session.messages.slice(0,2).map(msg=>({
            role: msg.role === "interviewer" ? "assistant" : "user",
            content: msg.content
        }))
        conversation.push(...pinnedIntro)
    }

    const recentBuffer = session.messages.slice(2).slice(-6).map(msg=>({
        role: msg.role === "interviewer" ? "assistant" : "user",
        content: msg.content
    }))

    conversation.push(...recentBuffer)

    const suggestedTopic = selectNextTopic(session.jobRole, session.topicsCovered)   

    const rawResponse = await continueInterviewWithAI(conversation, session.jobRole, session.difficultyLevel, session.topicsCovered, suggestedTopic)

    const parsed = validateAIResponse(rawResponse)

    const {score, evaluation, decision, nextQuestion, questionType, topic} = parsed

    if(lastMessage.score===null){
        lastMessage.score = score
        session.scores.push(score)
        session.totalScore += score
    }else{
        console.log(`Score for last message already set, skipping score update for session id ${session._id}`)
    }
    

    const interviewDuration = (Date.now()- new Date(session.startTime).getTime())/60000
    
    if(session.questionCount >= MAX_QUESTIONS || interviewDuration >= MAX_DURATION_MINUTES){
        session.status = "completed"
        await session.save()

        return{
            interviewCompleted:true,
            score,
            evaluation,
            finalScore: session.totalScore,
            totalQuestions: session.questionCount,
        }
    }    
    

    session.currentQuestionType = questionType

    let finalTopic = topic ? topic.toLowerCase() : null
    if(decision === "move_topic"){
        finalTopic = suggestedTopic ? suggestedTopic.toLowerCase() : finalTopic
    }
    if(decision === "followup"){
        finalTopic = session.currentTopic || topic
    }
    if(decision === "coding_question"){
        finalTopic = topic || session.currentTopic
    }
    session.currentQuestionType = questionType
    session.currentTopic = finalTopic

    if(finalTopic && !session.topicsCovered.includes(finalTopic)){
        session.topicsCovered.push(finalTopic)
    }

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

