import OpenAI from "openai";
import { validateCodeReviewResponse } from "../utils/codeReviewValidator.js";

export const reviewCodeWithAI = async (question , code, language) => {
    if(!process.env.OPENAI_API_KEY){
        throw new Error("OPENAI_API_KEY not found")
    }

    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
    })

    const prompt = `
You are a senior FAANG-level technical interviewer reviewing a coding solution.

Problem:
${question}

Candidate Code (${language}):

${code}

Analyze the solution.

Evaluate:

• correctness
• time complexity
• space complexity
• strengths
• weaknesses
• edge cases missed

Return ONLY JSON:

{
 "correctness":"correct | partially correct | incorrect",
 "timeComplexity":"Big-O",
 "spaceComplexity":"Big-O",
 "strengths":[""],
 "weaknesses":[""],
 "edgeCasesMissed":[""],
 "score":0-10,
 "feedback":"short explanation"
}
`

    const response = await client.chat.completions.create({

        model: "llama-3.1-8b-instant",

        messages: [
            { role: "system", content: "You are a FAANG-level coding interviewer." },
            { role: "user", content: prompt }
        ],

        temperature: 0.2
    })

    const raw = response.choices[0].message.content.trim()
    return validateCodeReviewResponse(raw)
}
