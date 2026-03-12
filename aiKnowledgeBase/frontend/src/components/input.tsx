
interface InputProp {
    variant?: string
    title: string
    placeholder: string
}

export default function Input({variant = "text", title, placeholder}: InputProp) {
    const id = title.toLowerCase().replaceAll(' ', '_')
    
    return <div className="flex flex-col gap-1 ">
        <label className="text-sm px-2 font-semibold" htmlFor={id}>
            {title}
        </label>
        <input id={id} className="w-full border border-slate-500 px-2 py-1 italic rounded-md " 
            type={variant} placeholder={placeholder}/>
    </div>
}