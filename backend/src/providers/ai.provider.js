import OpenAI from "openai"

const extractFirstJsonObject = (text) => {
    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()

    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")

    if (start === -1 || end === -1 || end <= start) {
        throw new Error("AI did not return valid JSON")
    }

    return cleaned.slice(start, end + 1)
}

export const generateQuestionsFromAI = async (jobRole)=>{

    if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not found in environment variables");
    }

    const groq = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL:"https://api.groq.com/openai/v1"
    })

    const prompt = `
        You are a senior FAANG-level technical interviewer conducting a live mock interview.

Role: ${jobRole}
Difficulty Stage: warmup

Your task is to generate the FIRST interview question.

Strict rules:

* Ask ONLY conceptual interview questions.
* The question must be answerable verbally without writing any code.
* Do NOT ask the candidate to implement, write, or complete code.
* Do NOT include any code snippets or pseudo-code.
* The topic MUST be directly related to the provided job role.
* Choose concepts that are commonly tested for this role in real FAANG interviews.
* The question should test reasoning, understanding, tradeoffs, debugging thinking, or architecture knowledge.
* Keep the question natural and concise as if asked during a real interview.

Topic constraints:

* The topic must be relevant to **${jobRole}**.
* Avoid unrelated subjects outside the role's domain.
* Examples:

  * Frontend → browser rendering, event loop, React concepts, state management
  * Backend → APIs, databases, concurrency, caching, scalability
  * AI/ML → model training, overfitting, bias-variance tradeoff, evaluation metrics
  * Data engineering → pipelines, distributed processing, consistency
  * DevOps → CI/CD, containers, observability, scaling

Forbidden:

* Coding tasks
* Code snippets
* "Write a function..."
* "Implement..."
* "Complete the code..."
* Any form of code block

Return ONLY valid JSON in this format:

{
"question": "interview question",
"topic": "main concept being tested",
"type": "concept"
}

Example:

{
"question": "What problem does the JavaScript event loop solve in the browser runtime?",
"topic": "event loop",
"type": "concept"
}
`
    const response = await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages:[
            {role:"system",content:"You are a senior FAANG-level technical interviewer."},
            {role:"user",content:prompt }
        ],
        temperature:0.3,
    })

    const raw = response.choices[0].message.content?.trim() || ""
    const jsonString = extractFirstJsonObject(raw)
    
    return JSON.parse(jsonString)
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
Current difficulty: ${difficultyLevel}

--- EVALUATION & SCORING PROTOCOL ---
1. MENTAL REFERENCE: Before scoring, mentally outline the "Ideal Senior Answer" including key technical pillars, trade-offs, and edge cases.
2. ANTI-BLUFF CHECK: 
   - 0 points for claims like "I am an expert" or "I know this well" if not followed by technical evidence. 
   - Confidence without substance is a failing grade.
3. HONESTY VS. BLUFFING: 
   - A candidate admitting "I don't know" but explaining their logical thought process scores HIGHER (2-3 points) than a candidate who bluffs (0 points).
4. GRADING SCALE:
   - 9-10: Matches or exceeds the Ideal Reference with high precision.
   - 6-8: Core logic is sound, but misses secondary details or trade-offs.
   - 3-5: Partially correct but contains factual errors or is too vague.
   - 0-2: No technical substance, a bluff, or a simple "I don't know."

--- SOFT LANDING & HINT LOGIC ---
1. IF CANDIDATE ADMITS "I DON'T KNOW": 
   - Briefly explain the concept (1 sentence) to maintain flow.
   - Decision = "move_topic". Pivot to a different sub-topic immediately.
2. IF CANDIDATE ASKS FOR A HINT:
   - Provide a small conceptual "nudge" without giving away the full answer.
   - Decision = "followup". Stay on topic to see if they can solve it with help.
3. THE GUIDING TONE: If the user struggles, be encouraging. Use phrases like: "No worries, it's a deep topic. Let's look at it from a different angle..."

--- CONVERSATIONAL RULES ---
- ACKNOWLEDGE & BRIDGE: Always start your response by briefly acknowledging their logic or honesty.
- THE PIVOT: Transition naturally. If they bluffed, stay firm: "I'm glad you're familiar with that; to dig deeper, how would you specifically handle [Detail]?"
- NO SCORES IN CHAT: Never reveal numeric scores to the candidate.

--- DECISION LOGIC ---
- Weak/Bluff/Hint Request: decision = "followup".
- Honest "I don't know" or Successful Answer: decision = "move_topic".
- Exceptional Mastery: decision = "coding_question".

Return ONLY valid JSON:
{
 "score": number,
 "evaluation": "Internal Note: Comparison to ideal reference. Did they bluff, admit ignorance, or show mastery?",
 "decision": "followup | move_topic | coding_question",
 "nextQuestion": "Your conversational response (Acknowledgment + Transition/Hint/Explanation + New Question)",
 "questionType": "concept | coding | followup",
 "topic": "specific sub-topic"
}
`;

    const response = await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        messages:[
            {role:'system',content:systemPrompt},
            ...conversation
        ],
        temperature:0.2,
        stream:true
    })

    let completeJson = "";
    let isStreamingQuestion = false;

    for await (const chunk of response) {
        const token = chunk.choices[0]?.delta?.content || "";
        completeJson += token;
        if (completeJson.includes('"nextQuestion":') && !completeJson.includes('"questionType":')) {
            isStreamingQuestion = true;
        } else if (completeJson.includes('"questionType":')) {
            isStreamingQuestion = false;
        }
        if (isStreamingQuestion && token) {
            const cleanToken = token.replace(/["\\]/g, ""); 
            if (cleanToken && io && sessionId) {
                io.to(sessionId).emit("ai_stream_chunk", { chunk: cleanToken });
            }
        }
    }

    return completeJson.trim();
}