import type { Server } from "ws"
import { wsAuth } from "./ws.auth";
import { attendanceCheckHandler, attendanceDoneHandler, attendanceHandler, classSummaryHandler } from "./ws.handler";


export const setupWs = (wss: Server) => {
    wss.on('connection', function connection(ws, req) {        
        wsAuth(ws, req);
        console.log(`Client ${ws.user?.userId} connected`)

        ws.on('error', console.error);
    
        ws.on('message', async function message(data, isBinary) {
            // only selective sends not broadcast
            // wss.clients.forEach(function each(client) {
            //     if (client.readyState === WebSocket.OPEN) {
            //         client.send(data, {binary: isBinary});
            //     }   
            // });

            try {
                const parsedData = JSON.parse(data.toLocaleString())

                if (parsedData.event == "ATTENDANCE_MARKED") {
                    // attendance handler
                    attendanceHandler(ws, parsedData.data, wss);
                } else if (parsedData.event == "TODAY_SUMMARY") {
                    // today summary gen
                    await classSummaryHandler(ws, wss);
                } else if (parsedData.event == "MY_ATTENDANCE") { 
                    // my attendance check
                    attendanceCheckHandler(ws, wss);
                } else if (parsedData.event == "DONE") {
                    // done
                    await attendanceDoneHandler(ws, wss);
                } else {
                    ws.send("Unable to process your request")
                }
                
            } catch(e) {
                console.error(e)
            }
    
            ws.send("Hello! Message from Server");
        });
    });


}