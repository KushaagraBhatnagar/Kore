import mongoose from "mongoose"
import dns from "dns"
dns.setServers(["8.8.8.8", "8.8.4.4"])

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            serverSelectionTimeoutMS: 5000,
        })
        console.log("MongoDB connected")
    }catch(error){
        console.log("MongoDB connection error", error)
        process.exit(1)
    }
}

export default connectDB