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
                },
                topic:{
                    type:String,
                    default:null
                },
                score:{
                    type:Number,
                    default:null
                }
            }
        ],
        topicsCovered:[
            {
                type:String
            }
        ],
        questionCount:{
            type:Number,
            default:0
        },
        codingQuestionsAsked:{
            type:Number,
            default:0
        },
        difficultyLevel:{
            type:String,
            enum:["warmup","core","advanced","challenge"],
            default:"warmup"
        },
        startTime:{
            type:Date,
            default:Date.now
        },
        status:{
            type:String,
            enum:["active","completed"],
            default:"active"
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