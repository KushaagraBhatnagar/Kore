export default function Badge({text,color}){
    const base = 'text-xs font-semibold px-3 py-1 rounded-full'

    const variants = {
        coding: `${base} bg-yellow-900/50 text-yellow-300 border border-yellow-800`,
        followup: `${base} bg-purple-900/50 text-purple-300 border border-purple-800`,
        default : `${base} bg-blue-900/50 text-blue-300 border border-blue-800`,
    }

    return <span className={variants[color] ?? variants.default}>{text}</span>
}