import {z} from "zod"

const codeReviewSchema = z.object({
    correctness: z.enum(["correct","partially correct","incorrect"]),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    edgeCasesMissed: z.array(z.string()),
    score: z.number().min(0).max(10),
    feedback: z.string()
})

export const validateCodeReviewResponse = (rawResponse) => {
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

    const result = codeReviewSchema.safeParse(parsed)
    if(!result.success){
        throw new Error("AI response failed validation: " + result.error.message)
    }
    return result.data
}