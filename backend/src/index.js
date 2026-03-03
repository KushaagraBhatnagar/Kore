import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import connectDB from "./config/db.js"


//call kia connect from config to connect to DB
connectDB()

const PORT = process.env.PORT || 8000

app.listen(PORT, ()=>{
    console.log(`Example app listening on port http://localhost:8000`)
})
