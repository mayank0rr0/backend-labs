import express from "express";
import { prisma } from "../db";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";

const bookingsRouter = express.Router();

bookingsRouter.post('/test', async (req, res) => {
    console.log(req.body)
    return res.json({msg: "hello"})
})

bookingsRouter.post('/', async (req, res) => {
    const {carName, days, rentPerDay, user} = req.body;
    
    // check if all the data required are present
    if (carName && days <= 365  && rentPerDay <= 2000) {
        
        console.log(carName, days, rentPerDay, user)

        try {
            // try to create a booking 
            const booking = await prisma.bookings.create({
                data: {
                    car_name: carName,
                    days: days,
                    rent_per_day: rentPerDay,
                    status: "booked",
                    user_id: user.userId
                }
            })
            // on creation of data respond with the necessary data
            return res.status(201).json({
                success: true,
                data: {
                    message: "Booking Created successfully",
                    bookingId: booking.id,
                    totalCost: rentPerDay * days
                }
            })
        } catch(e) {
            console.error(e)
            // on error give respond with server error
            return res.status(501).json({
                success: false,
                error: "Internal Server Error",
            })
        }

     } else {
        // if the data is not present give invalid data error
        return res.status(400).json({
            success : false,
            error: "Invalid Input"
        })
    }
})

bookingsRouter.get('/', async (req, res) => {
    let bookingId = req.query.bookingId;
    const summary = Boolean(req.query.summary);
    const user = req.body.user;

    if (bookingId) {
        // if bookingId is present 
        try {
            // look if its array
            if (Array.isArray(bookingId)) {
                // change the variable to first element of the array 
                bookingId = bookingId[0]
            }

            // fetch the db entry for the first entry with the given userId and bookingIs
            const data = await prisma.bookings.findFirst({
                    where: {
                        id: bookingId,
                        user_id: user.userId
                    },
                    select: {
                        id : true,
                        car_name: true,
                        days: true, 
                        rent_per_day: true,
                        status: true
                    }
                })

            // no data found then return 404
            if (!data) {
                return res.status(404).json({
                    success : false,
                    error: "Booking not found"
                })
            }

            return res.status(200).json({
                success: true,
                data: [
                    {...data, totalCost: data.rent_per_day * data.days}
                ]
            })

        } catch(e) {
            console.error(e)
            return res.status(501).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    } else if (summary) {
        // if summary is true i.e., bookingId is not present
        try {
            const data = await prisma.bookings.findMany({
                    where: {
                        user_id: user.userId,
                        status: { in : ["booked", "completed"]}
                    },
                    select: {
                        id : true,
                        car_name: true,
                        days: true, 
                        rent_per_day: true,
                        status: true
                    }
                })

            // if data is not found return 404
            if (!data) {
                res.json({
                    success: false,
                    error: "No Bookings found" 
                })
            }
            
            // calculate the total amount -- also can be implemented using prisma $extend
            // TODO: implement using prisma 
            let totalAmount = 0
            data.map(x => {totalAmount = totalAmount + (x.days * x.rent_per_day)})

            return res.status(200).json({
                success : true,
                data: {
                    user_Id : user.userId,
                    username: user.username,
                    totalBookings: data.length,
                    totalAmountSpent: totalAmount
                }
            })
        } catch (e) {
            console.error(e)
            return res.status(501).json({
                success: false,
                error: "Internal server Error",
            })
        }
    } else {
        // If no summary ot bookingId params are provided
        return res.status(400).json({
            success: false,
            error: "Provide bookingId or summary params"
        })
    }
})

bookingsRouter.put('/:bookingId', async (req, res) => {
    const bookingId = req.params.bookingId;
    const {carName, days, rentPerDay, status, user} = req.body;

    
    try {
        // try to get data for checking authorization
        const data = await prisma.bookings.findUnique({
            where: {
                id: bookingId
            },
            select: {
                user_id: true
            }
        })
    
        if (!data) {
            // if no data found
            return res.status(404).json({
                success: false,
                error: "Booking not found"
            });
        } else if ( data.user_id != user.userId) {
            // if data does not belong to the user
            return res.status(403).json({
                success: false,
                error: "Booking does not belong to the user"
            })
        }

        if (carName && days && rentPerDay && !status) {
            // check for vars other than status update
            const updatedBooking = await prisma.bookings.update({
                where: {
                    id: bookingId,
                    user_id: user.userId
                },
                data: {
                    car_name: carName,
                    days: days,
                    rent_per_day: rentPerDay
                }
            })

            return res.json({
                success: true,
                data: {
                    message: "Booking update successful",
                    booking: {
                        id: updatedBooking.id,
                        car_name: updatedBooking.car_name,
                        days: updatedBooking.days,
                        rent_per_day: updatedBooking.rent_per_day,
                        status: updatedBooking.status,
                        totalCost: updatedBooking.days * updatedBooking.rent_per_day
                    }
                }
            })

        } else if (status) {
            // check for status var for only status update
            const updatedBooking = await prisma.bookings.update({
                where: {
                    id: bookingId,
                    user_id: user.userId
                },
                data: {
                    status:"completed"
                }
            })

            return res.json({
                success: true,
                data: {
                    message: "Booking update successful",
                    booking: {
                        id: updatedBooking.id,
                        car_name: updatedBooking.car_name,
                        days: updatedBooking.days,
                        rent_per_day: updatedBooking.rent_per_day,
                        status: updatedBooking.status,
                        totalCost: updatedBooking.days * updatedBooking.rent_per_day
                    }
                }
            })

        } else {
            return res.status(400).json({
                success: false,
                error: "Invalid inputs"
            })
        }

    } catch(e) {
        console.error(e)
        return res.status(501).json({
            success: false,
            error: "Internal server error"
        });
            }
        }
)

bookingsRouter.delete('/:bookingId', async (req, res) => {
    const bookingId = req.params.bookingId;
    const {user} = req.body;

    try {
        // try to fetch data for authorization checks
        const data = await prisma.bookings.findUnique({
            where: {
                id: bookingId
            },
            select: {
                user_id: true
            }
        })
    
        if (!data) {
            // check if data exists or not
            return res.status(404).json({
                success: false,
                error: "Booking not found"
            });
        } else if ( data.user_id != user.userId) {
            // check if data belongs to the user
            return res.status(403).json({
                success: false,
                error: "Booking does not belong to the user"
            })
        }

        // delete the data
        await prisma.bookings.delete({
            where: {
                id: bookingId,
                user_id: user.userId
            }
        })

        return res.status(200).json({
            success: true,
            data: {
                message: "Booking deleted successfully"
            }
        })

    } catch (e) {
        console.log(e)
        return res.status(501).json({
            success: false,
            error: "Internal server error"
        });
    }
})

export default bookingsRouter;