import "dotenv/config"
import mongoose from "mongoose"

const mongoURI = process.env.DB_URL || ''

export const dbConnect = async () => {
    try {
        await mongoose.connect(mongoURI)
        console.log("DB Connection established")
    } catch(e) {
        console.error(e)
    }

}