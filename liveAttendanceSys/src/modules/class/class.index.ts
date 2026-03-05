import express from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { AddStudentSchema, ClassSchema } from '../../schema/class.schema';
import { ZodError } from 'zod';
import { Attendance, Cls, User } from '../../config/db/db.models';

export const classRouter = express.Router();

// add authMiddleware to /class paths
classRouter.use(authMiddleware)

// endpoint to create a class by a teacher
classRouter.post('/', async (req, res) => {
    // get userPayload from req
    const user = req.user;

    if (user && user.role != "teacher") {
        // if user is not teacher the return 403
        return res.status(403).json({
            success: false,
            error: "Forbidden, teacher access required"
        })
    }

    try {
        // parse data acc to class schema
        const parsedData = ClassSchema.parse(req.body);

        // create new data with req data
        const classObj = new Cls({
            ...parsedData, 
            teacherId: user?.userId
        })
        // save data to the db
        await classObj.save()
        // return the data
        return res.status(200).json({
            success: true,
            data: {
                _id: classObj._id,
                className: classObj.className,
                teacherId: classObj.teacherId,
                studentIds: classObj.studentIds
            } 
        })
        
    } catch(e) {
        // on error log it
        console.error(e);

        if (e instanceof ZodError) {
            // if error was from Zod then send 400 invalid req
            return res.status(400).json({
                success: false,
                error: "Invalid request schema"
            })
        } else if ((e as Error).message.includes("E1100")) {
            // if error has duplicate error from Mongo
            return res.status(409).json({
                success: false,
                error: "Class already exists"
            })                
        } else {
            // for everything other give 501
            return res.status(501).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }
})

// Endpoint to add students to the class by the class teacher
classRouter.post('/:id/add-student', async (req, res) => {
    const user = req.user;
    const classId = req.params.id;
    // getting the class to check for existence and ownership
    const classObj = await Cls.findOne({_id : classId});

    if (!classObj) {
        // if no class
        return res.status(404).json({
            success: false,
            error: "Class not found"
        })
    } else if (user && user.userId != String(classObj.teacherId)) {
        // if not owned by user
        return res.status(403).json({
            success: false,
            error: "Forbidden, not class teacher"
        })
    }

    try {
        // parse the data using zod
        const parsedData = AddStudentSchema.parse(req.body);
        // Finding student to check existence
        const student = await User.findOne({_id: parsedData.studentId}, { email: 0, password: 0, __v: 0})

        // Checking if student exists or the role is student or not 
        if (!student || student.role != "student") {
            return res.status(404).json({
                success: false,
                error: "Student Not Found"
            })
        }

        const updatedData = await Cls.findOneAndUpdate( {_id: classId}, {
            // this is adding the data to a list without creating the duplicate
            $addToSet: {studentIds: parsedData.studentId}
            }, {
            returnDocument: 'after', 
            select: {
                __v:false
            }
        });

        return res.status(200).json(updatedData)

    } catch (e) {
        console.error(e)

        if (e instanceof ZodError) {
            return res.status(400).json({
                success: false,
                error: "Invalid request schema"
            })
        } else {
            return res.status(200).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    }


})

// to get class details by id
classRouter.get('/:id', async (req, res) => {
    const user = req.user;
    const id = req.params.id;

    try {
        const classObj = await Cls.findOne({_id: id}, {__v:0}).populate({
            path: 'studentIds',
            select: '_id name email'
        })

        if (classObj == null) {
            return res.status(404).json({
                success: false,
                error: "Class not found"
            })
        } else if (user) {

            const teacherCheck = String(classObj.teacherId) == user.userId;
            const studentCheck = classObj.studentIds.map((x) => { 
                if (String(x._id) == user.userId) { 
                    return true 
                } else { 
                    return false 
                } }).includes(true) 
            
            if (!teacherCheck || studentCheck)  {        
                return res.status(403).json({
                        success : false,
                        error: "Forbidden, user not in the class"
                })}
            
        }
            
        res.status(200).json({
            success: true,
            data: {
                _id: classObj._id,
                name: classObj.className,
                teacherId: classObj.teacherId,
                students: classObj.studentIds
                }
        })
        
    } catch (e) {
        console.log(e)

        return res.status(501).json({
            success: false,
            error: "Internal server error"
        })
    }
});

// to register attendance
classRouter.get('/:id/my-attendance', async (req, res) => {
    // get the class id parameter from path 
    const classId = req.params.id;
    // get the request user object 
    const user = req.user;

    
    try {
        // try to find the class in thw database
        const classObj = await Cls.findOne({_id: classId})

        // if the role of the user is student
        if (user && classObj && user.role == "student") {
            
            // if the student not in the class
            if ( !(classObj.studentIds.map(x => {
                if (String(x) == user.userId) {
                    return true
                } else {
                    return false
                }
            }).includes(true)) ) {
                // return 403 not in class
                return res.status(403).json({
                    success: false,
                    error: "Forbidden, user not in class"    
                })
            }
        } else if ( user && user.role == "teacher") {
            // if user is not a student return 403 only students allowed
            return res.status(403).json({
                success: false,
                error: "Forbidden, only students allowed"
            })
        } else if (!classObj || !user) {
            return res.status(404).json({
                success: false,
                error: "Class not found"
            })
        }

        try {
            // try to get attendance data for given class and user
            const attendance = await Attendance.findOne({
                studentId: user.userId,
                classId: classId
            }, {__v: 0, studentId: 0})

            // return the data from db
            return res.status(200).json({
                success: true,
                data: attendance
            })

        } catch (e) {
            // if not found and throws error then return status - null
            return res.status(200).json({
                success: true,
                data: {
                    classId: classId,
                    status: null
                }
            })
        }
    } catch (e) {
        console.error(e)
        // can return class not found too
        // return internal server error
        return res.status(501).json({
            success: false,
            error: "Internal server error"
        })
    }
})