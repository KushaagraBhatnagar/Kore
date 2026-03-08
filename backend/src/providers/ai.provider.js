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

export const continueInterviewWithAI = async (conversation, jobRole, difficultyLevel, topicsCovered = [], suggestedTopic) => {
    if(!process.env.OPENAI_API_KEY){
        throw new Error("OPENAI_API_KEY not found in environment variables")
    }

    const groq = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL:"https://api.groq.com/openai/v1"
    })

    const systemPrompt = `
You are a senior FAANG-level technical interviewer.

Role: ${jobRole}

Current difficulty stage: ${difficultyLevel}

Topics already covered:
${topicsCovered.join(", ") || "none"}

Suggested next topic:
${suggestedTopic}

Evaluate the candidate answer and decide how the interview should proceed.

Rules:

If the answer is weak or incomplete:
→ decision = followup
Ask a deeper question on the SAME topic.

If the answer is good:
→ decision = move_topic
Move to a new topic according to the suggested topic i.e (${suggestedTopic}) and ask next question about it.

If the candidate shows very strong understanding:
→ decision = coding_question
Ask a coding problem related to the topic.

Return ONLY JSON:

{
 "score": number between 0 and 10,
 "evaluation": "short evaluation",
 "decision": "followup | move_topic | coding_question",
 "nextQuestion": "interviewer question",
 "questionType": "concept | coding | followup",
 "topic": "topic of the question"
}
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