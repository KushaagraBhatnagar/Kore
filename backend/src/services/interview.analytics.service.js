import InterviewSession from "../models/interviewSession.model.js";
import Message from "../models/message.model.js";
export const generateInterviewReportService = async (sessionId) => {

    const session = await InterviewSession.findById(sessionId)

    if(!session){
        throw new Error("Session not found")
    }

    if(session.status !== "completed"){
        throw new Error("Interview session is not completed yet")
    }

    const totalQuestions = session.questionCount
    const totalScore = session.totalScore
    const averageScore = totalQuestions > 0 ? (totalScore/totalQuestions) : 0

    const topicScores = {}

    const messages = await Message.find({sessionId})
    messages.forEach(msg => {
        if(msg.role === "interviewer" && msg.topic && msg.score !== null){
            if(!topicScores[msg.topic]){
                topicScores[msg.topic]=[]
            }
            topicScores[msg.topic].push(msg.score)
        }
    })

    const strongTopics = []
    const weakTopics = []

    Object.keys(topicScores).forEach(topic=>{
        const scores = topicScores[topic]
        const avg = scores.reduce((a,b)=>a+b,0)/scores.length
        if(avg >=7){
            strongTopics.push(topic)
        }else if(avg <=4){
            weakTopics.push(topic)
        }
    })
    return{
        totalQuestions,
        totalScore,
        averageScore,
        difficultyReached: session.difficultyLevel,
        strongTopics,
        weakTopics,
        codingQuestionsAsked: session.codingQuestionsAsked,
        feedback: `You performed well on ${strongTopics.length} topics, but struggled with ${weakTopics.length} topics. Focus on improving your understanding of ${weakTopics.join(", ")} to boost your performance in future interviews.`
    }

}