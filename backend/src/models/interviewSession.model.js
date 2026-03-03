import mongoose from "mongoose"

//schema banaya
const interviewSessionSchema = new mongoose.Schema(
    {
        jobRole:{
            type:String,
            required:true,
        },
        questions:[String],
        answers:[String],
        scores:[Number],
        totalScore:{
            type:Number,
            default:0,
        },
    },
    {timestamps:true}
);

//model me daaldia schema
const InterviewSession = mongoose.model(
    "InterviewSession",
    interviewSessionSchema
)

export default InterviewSession;