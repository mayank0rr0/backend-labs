import axios from "axios"

export const postReq = async (query: string, userId: string) => {
    try {
        
        const response = await axios.post('http://localhost:8000/query',
            {
                query, 
                userId 
            }
        ) 

        return {
            success: true,
            data: response.data
        }
    } catch (e) {
        return {
            success: false,
            error: "Internal Error"
        }
    }
}