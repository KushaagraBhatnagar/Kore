import express from "express"
import cors from "cors"
import errorMiddleware from "./middlewares/error.middleware.js"
import router from "./routes/interview.routes.js"
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/interview",router);

app.get("/",(req,res)=>{
    res.send("Backend running")
})

app.use(errorMiddleware)
export default app