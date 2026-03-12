
interface SectionHeadProp {
    title: string,
    subs: string 
}

export default function SectionHead({title, subs}: SectionHeadProp) {
    return <div className="h-18 p-5 text-xl">
        <h1 className="font-bold text-blue-600">
            {title}
        </h1>
        <h3 className="text-xs">
            {subs}
        </h3>
    </div>
}