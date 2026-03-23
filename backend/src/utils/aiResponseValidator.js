import { z } from "zod";

const aiInterviewResponseSchema = z.object({
    score: z.number().min(0).max(10),
    evaluation: z.string(),
    decision: z.enum(["followup", "move_topic", "coding_question"]),
    nextQuestion: z.string(),
    questionType: z.enum(["concept", "coding", "followup"]),
    topic: z.string().nullable().optional(),
});

const safeFallback = {
    score: 5,
    evaluation: "Could not parse AI response",
    decision: "followup",
    nextQuestion: "Let's continue. Can you elaborate on that?",
    questionType: "followup",
    topic: null,
};

const extractJsonObject = (text) => {
    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
        return null;
    }

    return cleaned.slice(start, end + 1);
};

export const validateAIResponse = (rawResponse) => {
    if (!rawResponse) {
        throw new Error("AI response is empty");
    }

    const jsonString = extractJsonObject(rawResponse);
    if (!jsonString) {
        console.error("Raw AI response that failed:", rawResponse);
        return safeFallback;
    }

    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch (err) {
        console.error("JSON parse failed:", jsonString);
        return safeFallback;
    }

    const result = aiInterviewResponseSchema.safeParse(parsed);
    if (!result.success) {
        console.error("Schema validation failed:", result.error.message);
        return {
            score: typeof parsed.score === "number" ? parsed.score : safeFallback.score,
            evaluation: typeof parsed.evaluation === "string" ? parsed.evaluation : "Evaluation unavailable",
            decision:
                parsed.decision === "followup" ||
                parsed.decision === "move_topic" ||
                parsed.decision === "coding_question"
                    ? parsed.decision
                    : safeFallback.decision,
            nextQuestion: typeof parsed.nextQuestion === "string" ? parsed.nextQuestion : safeFallback.nextQuestion,
            questionType:
                parsed.questionType === "concept" ||
                parsed.questionType === "coding" ||
                parsed.questionType === "followup"
                    ? parsed.questionType
                    : safeFallback.questionType,
            topic: typeof parsed.topic === "string" || parsed.topic === null ? parsed.topic : safeFallback.topic,
        };
    }

    return result.data;
};