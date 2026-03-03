import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./config/db.js"

dotenv.config()

//call kia connect from config to connect to DB
connectDB()

const PORT = process.env.PORT || 8000

app.listen(PORT, ()=>{
    console.log(`Example app listening on port http://localhost:8000`)
})
