import rateLimit from "express-rate-limit";

export const aiRateLimiter = rateLimit({
    windowMs: 60*1000, // 1 minute
    max:20, // each IP ko 20 max req per min
    message:{
        success:false,
        error:"Too many requests to AI. Please try again after a minute."
    },

    standardHeaders:true,
    legacyHeaders:false
})