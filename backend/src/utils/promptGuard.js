export const isPromptInjection = (text) => {
    if(!text) return false;

    const lowerText = text.toLowerCase();

    const suspiciousPhrases = [
        "ignore previous instructions",
        "disregard previous instructions",
        "forget previous instructions",
        "ignore previous",
        "ignore all prior",
        "system prompt",
        "give me full marks",
        "score 10",
        "score: 10",
        "output json",
        "developer mode",
        "forget your instructions",
        "you are now",
        "bypass"
    ]

    return suspiciousPhrases.some(phrase => lowerText.includes(phrase));
}