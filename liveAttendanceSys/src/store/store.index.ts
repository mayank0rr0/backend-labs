
interface activeSessionType {
    classId : string | undefined
    startedAt : string | undefined
    attendance : { [key: string]: string } | undefined
}

export const activeSession : activeSessionType = {
    classId: undefined,
    startedAt: undefined,
    attendance: undefined
}