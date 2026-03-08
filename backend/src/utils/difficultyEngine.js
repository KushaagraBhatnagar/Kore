export const calculateDifficulty = (scores = []) => {
    if(scores.length === 0){
        return "warmup"
    } 

    const recentScores = scores.slice(-3)

    const avg = recentScores.reduce((a,b) =>a+b,0 )/recentScores.length

    if(avg <= 4){
        return "warmup"
    }

    if(avg <= 6){
        return "core"
    }

    if(avg <= 8){
        return "advanced"
    }

    return "challenge"
}