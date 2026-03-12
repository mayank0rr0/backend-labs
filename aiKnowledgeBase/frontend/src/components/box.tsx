import type { ReactNode } from "react";

export default function CenterBox({children, wide = true, big = true}: {children: ReactNode, wide?: boolean, big?: boolean}) {
    const height = big ? "h-[50%]" : "h-[45%]"
    const width = wide ? " w-[80%]" : " w-[35%]"
    const cls =  height + width + " rounded-md bg-white shadow-md border border-blue-100 flex flex-col"

    return <div className="flex flex-row justify-center items-center h-screen w-full border-r border-slate-100 bg-gray-50 ">
        <div className={cls}>
            {children}
        </div>
    </div>
}