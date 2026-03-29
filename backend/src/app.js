import express from "express"
import cors from "cors"
import errorMiddleware from "./middlewares/error.middleware.js"
import router from "./routes/interview.routes.js"
import codeReviewRouter from "./routes/codeReview.routes.js"
import authRouter from "./routes/auth.routes.js"
const app = express()

app.use(cors({origin:'http://localhost:5173'})) // allow requests from frontend
app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/interview",router);
app.use("/api/code", codeReviewRouter)

app.get("/",(req,res)=>{
    res.send("Backend running")
})



app.use(errorMiddleware)
export default app