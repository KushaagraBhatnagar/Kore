import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    }
},
    {timestamps:true}
)

//pass ko hash kia save krne se pehle
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10)
})

//userSchema ka ek method hai comparePassword jisse compare kia candidate ne jo pass dala usko db ke pass se
userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)
export default User