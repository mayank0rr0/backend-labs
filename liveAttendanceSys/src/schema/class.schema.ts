import * as z from "zod";

export const ClassSchema = z.object({
    className: z.string()
})

export const AddStudentSchema = z.object({
    studentId: z.string()
})