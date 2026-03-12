import CenterBox from "./box";

export default function UserBox() {
    return <CenterBox wide={false}>
            <div className="flex justify-center h-16">
                <div className="w-[15vh] h-[15vh] self-center rounded-full bg-blue-400 relative -top-8">
                </div>
            </div>
            <div className="grow">
                <div className="flex flex-col justify-center items-center">
                    <div className="text-3xl font-bold bg-linear-90 from-blue-950 via-blue-400 to-blue-950 bg-clip-text text-transparent 
                        pb-5 border-b border-b-gray-300 w-full text-center">
                        Hello, User
                    </div>
                    <div className="p-4 flex flex-col text-center ">
                        <div className="font-semibold text-gray-400">
                            Email
                        </div>
                        <div className="text-lg font-semibold text-blue-900">
                            User@example.com
                        </div>
                    </div>
                    <div className="p-4 flex flex-col text-center">
                        <div className="font-semibold text-gray-400">
                            Id
                        </div>
                        <div className="text-lg font-semibold text-blue-900">
                            7240a9bb-f17b-4c40-b61e-7b6baf06fdd3
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center h-16">
                <button className="w-50 h-15 self-center rounded-full relative -bottom-5 text-xl font-semibold
                    bg-blue-400 text-white hover:bg-blue-600">
                    Logout
                </button>
            </div>
    </CenterBox>
} 