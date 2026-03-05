import { WebSocket, type WebSocketServer } from "ws"
import { activeSession } from "../../store/store.index"
import { Attendance, Cls } from "../../config/db/db.models"

export const attendanceHandler = (ws: WebSocket, data: {studentId: string, status: string}, wss: WebSocketServer) => {

    if (ws.user && ws.user.role == "teacher") {
        if (!activeSession.classId) {
            ws.close(1000, "No active sessions")
        } else {
            if (activeSession.attendance) {
                activeSession.attendance[data.studentId] = data.status

                clientBroadcast(wss, JSON.stringify({
                        event: "ATTENDANCE_MARKED",
                        data: {
                            studentId: data.studentId,
                            status: data.status
                        }
                }))
            }
        }}
}

export const classSummaryHandler = async (ws: WebSocket, wss: WebSocketServer) => {
    if (ws.user?.role != "teacher") {
        ws.send("Action allowed for teachers only")
    }


    if (activeSession.attendance) {
        let countPre = 0

        // TODO : No need for this as only the present students are inside activeSession attendance obj 

        const asArray = Object.entries(activeSession.attendance);
        asArray.forEach(([k,v]) => {
            if (v == "present") {
                countPre += 1
            }})
        
        try {
            const classObj = await Cls.findOne({_id: activeSession.classId}, {_id: 0, __v:0, teacherId: 0, className: 0})

            const total = classObj?.studentIds.length || 0
            const countAbs = total - countPre
            
            clientBroadcast(wss, JSON.stringify({
                event: "TODAY_SUMMARY",
                data: {
                    present: countPre,
                    absent: countAbs,
                    total: countAbs + countPre
                }
            }))
        } catch (e) {
            ws.send("DB error")
        }
        

    } else if (!activeSession.classId) {
        ws.close(1000,"No active session")
    } else {
        ws.close(1000, "Nobody present")
    }
}

export const attendanceCheckHandler = (ws: WebSocket, wss: WebSocketServer ) => {
    if (ws.user?.role != "student") {
        ws.send("Action allowed for students only")
    }

    const studentId = ws.user?.userId

    if (studentId && activeSession.attendance && activeSession.attendance[studentId] == "present") {
        clientBroadcast(wss, JSON.stringify({
            event : 'MY_ATTENDANCE',
            data: {
                status: "present"
            }
        }))
    } else {
        clientBroadcast(wss, JSON.stringify({
            event : 'MY_ATTENDANCE',
            data: {
                status: "not yet updated"
            }
        }))
    }
}

export const attendanceDoneHandler = async (ws: WebSocket, wss: WebSocketServer) => {
    if (ws.user?.role != "teacher") {
        ws.send("Action allowed to teachers only")
    } 

    try {
        const classObj = await Cls.findOne({
            _id : activeSession.classId
        }, {__v: 0, teacherId: 0, _id: 0, className: 0 })

        
        if (activeSession.attendance && classObj) {
            const asArray = Object.entries(activeSession.attendance)
            const attArray = asArray.map(([k,v]) => k)
            const totalStudents = classObj.studentIds.length
            const presentStudents = asArray.length  
            
            classObj?.studentIds.forEach( x => {
                const status = (attArray.includes(String(x))) ? "present" : "absent"
                    
                const attendance = new Attendance({
                    classId: activeSession.classId,
                    studentId: String(x),
                    status: status
                }) 
                
                attendance.save()
            })

            activeSession["classId"] = undefined;
            activeSession["attendance"] = undefined;
            activeSession["startedAt"] = undefined;

            clientBroadcast(wss, JSON.stringify({
                event: "DONE",
                data: {
                    message: "Attendance persisted",
                    present: presentStudents,
                    absent: (totalStudents - presentStudents),
                    total: totalStudents
                }
            }))

        } else {
            ws.send("No Active class")
        }
    } catch (e) {
        ws.send("DB error")
    }
}

const clientBroadcast = (wss: WebSocketServer, message: string) => {
    wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
}