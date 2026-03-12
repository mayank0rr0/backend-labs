import type { ReactNode } from "react";

export default function FormBox({children}: {children: ReactNode}) {
    return <div className="grow px-8">
        <div className="flex flex-col h-full justify-around">
            {children}
        </div>
    </div>
}