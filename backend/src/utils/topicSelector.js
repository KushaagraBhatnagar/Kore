import { roleTopicMap } from "../config/roleTopicMap.config.js";
import { topicCategories } from "../config/topicCategories.config.js";

export const selectNextTopic = (jobRole, topicsCovered) =>{
    const role = jobRole.toLowerCase()

    const categories = roleTopicMap[role] || ["backend"]

    const lowerTopicsCovered = topicsCovered.map(t=>t.toLowerCase())
    let subtopicPool = []

    categories.forEach(category => {
        const topics = topicCategories[category]
        if(!topics) return

        Object.keys(topics).forEach(topic => {
            topics[topic].forEach(subtopic=>{
                if(!lowerTopicsCovered.includes(subtopic.toLowerCase())){
                    subtopicPool.push(subtopic)
                }
            })
        })
    })

    if(subtopicPool.length === 0) return "general software engineering concepts"

    return subtopicPool[Math.floor(Math.random() * subtopicPool.length)]
}