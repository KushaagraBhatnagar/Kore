import express from "express"
import cors from "cors"
import router from "./routes/interview.routes.js"
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/interview",router);

app.get("/",(req,res)=>{
    res.send("Backend running")
})

export default app