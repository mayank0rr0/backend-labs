import express from "express";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {success, ZodError} from "zod";
import { Cls, Attendance } from '../../config/db/db.models';
import { AttendanceSchema } from '../../schema/attendance.schema';
import { activeSession } from "../../store/store.index";

export const attendanceRouter = express.Router();

attendanceRouter.use(authMiddleware);

attendanceRouter.post('/start', async (req, res) => {
    const user = req.user;

    try {
        const parsedData = AttendanceSchema.parse(req.body);
        const classObj = await Cls.findOne({_id: parsedData.classId})
        if (!classObj ) {
            
            return res.status(404).json({
                success: false,
                error: "Class not found"
            })
        } else if (user && String(classObj.teacherId) != user.userId) {
            
            return res.status(403).json({
                success: false,
                error: "Forbidden, not class teacher"
            })
        }

        activeSession["classId"] =  parsedData.classId,
        activeSession["startedAt"] =  new Date().toISOString(),
        activeSession["attendance"] =  {}
           
        
        return res.status(200).json({
            success: true,
            data: activeSession
        })
        

    } catch (e) {
        console.error(e)
        
        if (e instanceof ZodError) {
            return res.status(400).json({
                success: false,
                error: "Improper input schema"
            })
        } else {
            return res.status(501).json({
                success: false,
                error: "Internal server error"
            })
        }
    }
})