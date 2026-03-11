import { prisma } from "../db";

export const getUser = async ( userId: string ) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        })

        if (user) {
            return {
                success: true,
                data: user
            }
        } else {
            throw Error
        }

    } catch (e) {
        console.log(e);
        return {
            success: false,
            error: "DB error"
        }
    }
}