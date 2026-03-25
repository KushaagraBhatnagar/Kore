import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import connectDB from "./config/db.js"
import http from "http"
import { Server } from "socket.io"

//call kia connect from config to connect to DB
connectDB()

const PORT = process.env.PORT || 8000
const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
})

app.set("io",io)

io.on("connection",(socket)=>{
    console.log(`New Socket connected: ${socket.id}`)

    socket.on("join_session", (sessionId) => {
        socket.join(sessionId)
        console.log(`Socket ${socket.id} joined session room ${sessionId}`)
    })

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`)
    })
})


server.listen(PORT, ()=>{
    console.log(`Server & Socket.io running on http://localhost:${PORT}`)
})
