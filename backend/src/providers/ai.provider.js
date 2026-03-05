import OpenAI from "openai"

export const generateQuestionsFromAI = async (jobRole)=>{

    if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not found in environment variables");
    }

    const groq = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL:"https://api.groq.com/openai/v1"
    })

    const prompt = `
        You are a senior FAANG-level technical interviewer.

        You are starting a mock technical interview.

        Role: ${jobRole}
        Difficulty Stage: warmup

        Generate the FIRST interview question.

        Rules:
        - Ask a realistic interview question used in top tech companies.
        - The question should test real understanding.
        - Prefer conceptual reasoning or small practical scenarios.
        - Avoid extremely difficult system design questions.
        - Do NOT explain the answer.

        You must return ONLY JSON in this format:

        {
        "question": "interview question",
        "topic": "main topic being tested",
        "type": "concept | coding"
        }

        Example:

        {
        "question": "Explain how closures work in JavaScript and give a practical use case.",
        "topic": "closures",
        "type": "concept"
        }
    `
    const response = await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        messages:[
            {role:"system",content:"You are a senior FAANG-level technical interviewer."},
            {role:"user",content:prompt }
        ],
        temperature:0.7,
    })

    const raw = response.choices[0].message.content.trim()

    const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    
    return JSON.parse(cleaned)
}

export const continueInterviewWithAI = async (conversation, jobRole, difficultyLevel, topicsCovered = []) => {
    if(!process.env.OPENAI_API_KEY){
        throw new Error("OPENAI_API_KEY not found in environment variables")
    }

    const groq = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL:"https://api.groq.com/openai/v1"
    })

    const systemPrompt = `
            You are a senior FAANG-level technical interviewer.

            You are conducting a mock interview for the role: ${jobRole}.

            Current interview stage: ${difficultyLevel}

            Topics already covered in this interview:
            ${topicsCovered.length ? topicsCovered.join(", ") : "none"}

            Avoid repeating these topics unless asking a follow-up.

            Difficulty guidelines:

            warmup:
            - basic conceptual questions
            - simple understanding checks

            core:
            - practical engineering questions
            - real-world scenarios

            advanced:
            - deeper technical questions
            - debugging and architecture reasoning

            challenge:
            - complex algorithmic or system design problems

            When the candidate answers a question you must:

            1. Evaluate the candidate answer
            2. Give a short evaluation
            3. Ask the next question
            4. Identify the main topic of the new question

            Return ONLY valid JSON:

            {
            "score": number between 0 and 10,
            "evaluation": "short evaluation",
            "nextQuestion": "the next interviewer question",
            "questionType": "concept | coding | followup",
            "topic": "main technical topic of the question"
            }

            Example topic values:
            "closures"
            "event loop"
            "react rendering"
            "linked list"
            "dynamic programming"
            "system design"
        `

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