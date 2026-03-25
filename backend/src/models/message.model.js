import mongoose from "mongoose";
 const messageSchema = new mongoose.Schema({
    sessionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"InterviewSession",
        required:true,
        index:true
    },
    role:{
        type:String,
        enum:["interviewer","candidate", "system"],
        required:true
    },
    content:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum:["concept", "coding", "followup"],
        default:"concept"
    },
    topic:{
        type:String,
        default:null
    },
    score:{
        type:Number,
        default:null
    },
}, {timestamps:true});

const Message = mongoose.model("Message", messageSchema);

export default Message;