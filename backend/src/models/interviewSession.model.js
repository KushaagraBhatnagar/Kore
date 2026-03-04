import mongoose from "mongoose"

//schema banaya
const interviewSessionSchema = new mongoose.Schema(
    {
        jobRole:{
            type:String,
            required:true,
        },
        messages:[
            {
                role:{
                    type: String,
                    enum: ["interviewer","candidate"],
                    required:true
                },
                content:{
                    type:String,
                    required:true
                },
                type:{
                    type:String,
                    enum:["concept","coding","followup"],
                    default:"concept"
                }
            }
        ],
        difficultyLevel:{
            type:String,
            enum:["warmup","core","advanced","challenge"],
            default:"warmup"
        },
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