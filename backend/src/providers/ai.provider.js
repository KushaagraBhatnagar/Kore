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

        You are conducting a mock interview for the role: ${jobRole}.

        Generate the FIRST interview question.

        Rules:
        - Ask a realistic interview question used in top tech companies.
        - The question should test real understanding, not definitions.
        - Avoid overly generic questions.
        - Prefer practical scenarios or problem-solving questions.
        - Occasionally ask coding or debugging questions.
        - The question should be clear and concise.
        - Do NOT explain the answer.

        Respond ONLY with the question text.
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

export const continueInterviewWithAI = async (conversation, jobRole) => {
    if(!process.env.OPENAI_API_KEY){
        throw new Error("OPENAI_API_KEY not found in environment variables")
    }

    const groq = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL:"https://api.groq.com/openai/v1"
    })

    const systemPrompt = `
You are a senior FAANG-level technical interviewer.

Conduct a realistic technical interview for the role: ${jobRole}.

Rules:
- Ask follow-up questions based on the candidate's answer.
- If the answer is incorrect, challenge the candidate.
- If the answer is good, go deeper.
- Occasionally ask coding questions.
- Keep the interview natural and conversational.
- Respond with ONLY the next interviewer question.
`;

    const response = await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        messages:[
            {role:'system',content:systemPrompt},
            ...conversation
        ],
        temperature:0.7
    })

    return response.choices[0].message.content.trim()
}