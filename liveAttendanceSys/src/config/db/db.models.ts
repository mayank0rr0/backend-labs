import mongoose from "mongoose";

export enum UserRoles {
  "teacher",
  "student"
}

// User model and schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String, 
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: UserRoles,
    default: "student",
    required: true
  }
});

export const User = mongoose.model('User', userSchema);

// Class schema and model
const classSchema = new mongoose.Schema({
  className: {type: String, required: false, unique: true},
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentIds: [ 
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ]
});

export const Cls = mongoose.model('Cls', classSchema);

// Attendance enum
export enum AttendanceStatus {
  "present",
  "absent"
}

// Attendance eSchema and model
const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cls' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: AttendanceStatus,
    default: "absent",
    required: true
  }
})

export const Attendance = mongoose.model('Attendance', attendanceSchema)