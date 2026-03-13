import {z} from "zod";

const aiInterviewResponseSchema = z.object({
    score: z.number().min(0).max(10),
    evaluation: z.string(),
    decision: z.enum(["followup", "move_topic", "coding_question"]),
    nextQuestion: z.string(),
    questionType: z.enum(["concept","coding", "followup"]),
    topic: z.string().nullable().optional()
})

export const validateAIResponse = (rawResponse) => {
    if(!rawResponse){
        throw new Error("AI response is empty")
    }

    const cleaned = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    const match = cleaned.match(/{[\s\S]*}/)
    if(!match){
        throw new Error("No JSON object found in AI response")
    }
    let parsed
    try{
        parsed = JSON.parse(match[0])
    }catch(err){
        throw new Error("AI returned invalid JSON: " + err.message)
    }

    const result = aiInterviewResponseSchema.safeParse(parsed)
    if(!result.success){
        throw new Error("AI response failed validation: " + result.error.message)
    }
    return result.data
}