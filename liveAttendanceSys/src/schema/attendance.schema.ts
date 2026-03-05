import * as z from "zod";

export const AttendanceSchema = z.object({
  classId: z.string()
});
