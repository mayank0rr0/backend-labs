
const chat = [
    {
        sender: 'user',
        message: 'How is this reelvant'
    },
    {
        sender: 'system',
        message: 'Just looking how we can implement the chats.'
    },
    {
        sender: 'user',
        message: 'Okay, so is this working?'
    },
    {
        sender: 'system',
        message: 'Look for yourself'
    }
]

export default function ChatPage() {
    // implement redirecting logic here

    return <div className="h-screen bg-gray-200 flex flex-col-reverse py-8 px-10">
        {/* Query box */}
        <div className="w-full h-15 bg-white rounded-full flex justify-between items-center pl-10 pr-3">
            <input type="text" placeholder="Enter your query" className="h-full w-full"></input>
            <button className="rounded-full bg-blue-600 h-10 w-10 flex justify-center text-center text-white font-extrabold text-3xl " > {">"} </button>
        </div>

        {/* Chat Window */}
        <div className="h-full overflow-y-auto  ">
            <div className="h-full flex flex-col gap-4">
                {chat.map(x => <ChatBox sender={x.sender} message={x.message} />)}
            </div>
        </div>
    </div>
}

interface ChatBoxProp {
    sender: string
    message: string
}

export function ChatBox({sender, message} : ChatBoxProp) {
    const custom = (sender == 'user') ? "self-end bg-blue-600 text-white" : "bg-white"
    const cls = "px-5 py-2 w-[60%] border border-gray-300 rounded-xl " + custom


    return <div className={cls}>
        {message}
    </div>
}