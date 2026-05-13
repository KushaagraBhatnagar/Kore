export default function Badge({text,color}){
    const base = 'text-xs font-semibold px-3 py-1 rounded-full'

    const variants = {
        coding: `${base} bg-blue-50 text-blue-700 border border-blue-200`,
        followup: `${base} bg-slate-50 text-slate-700 border border-slate-200`,
        default : `${base} bg-blue-50 text-blue-700 border border-blue-200`,
    }

    return <span className={variants[color] ?? variants.default}>{text}</span>
}