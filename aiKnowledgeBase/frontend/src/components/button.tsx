import type { ReactNode } from "react";

export default function Button( {onClick, children} : {onClick: () => void, children: ReactNode}) {
    return <div className="w-full flex justify-center">
        <button className="h-10 bg-blue-600 text-white px-4 py-2 rounded-md w-[30%] m-4 hover:bg-white hover:text-blue-600 hover:border-2 hover:border-blue-600 font-semibold " 
            onClick={onClick}>
            {children}
        </button>
    </div>
}