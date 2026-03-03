import OpenAI from "openai"

export const generateQuestionsFromAI = async (jobRole)=>{

    if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not found in environment variables");
    }

    const groq = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL:"https://api.groq.com/openai/v1"
    })

    const prompt  = `
        You are a senior FAANG-level technical interviewer.
        Role: ${jobRole}
        Generate ONE realistic, non-trivial interview question.
        Avoid generic definitions.
        Return only the question text.
        Do not add explanation.
        `
    const response = await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        messages:[
            {role:"system",content:"You are a senior FAANG-level technical interviewer."},
            {role:"user",content:prompt }
        ],
        temperature:0.7,
    })

    return response.choices[0].message.content.trim()
}