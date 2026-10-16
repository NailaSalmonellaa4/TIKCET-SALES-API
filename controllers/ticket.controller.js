/** load model */
const seatModel = require(`../models/index`).seat
const userModel = require(`../models/index`).user
const eventModel = require(`../models/index`).event
const ticketModel = require(`../models/index`).ticket
const diskonModel = require(`../models/index`).diskon

/** load Operation from Sequelize */
const Op = require(`sequelize`).Op

/** create function for add new ticket */
exports.addTicket = async(request, response) => {
    let body = request.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {}
    }

    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        return response.json({
            success: false,
            message: `Request body is empty or invalid. Please select 'JSON' dropdown next to 'raw' in Postman Body tab.`
        })
    }

    const bookedDate = new Date()
    let { eventID, userID, seats, id_diskon } = body;

    if (request.user && request.user.role === 'user') {
        userID = request.user.userID || request.user.id
    }

    if (!eventID) {
        return response.json({
            success: false,
            message: `eventID is required in request body`
        })
    }

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
        return response.json({
            success: false,
            message: `Seats parameter must be a non-empty array`
        })
    }

    try {
        const event = await eventModel.findOne({
            where: { eventID: eventID }
        })

        if (!event) {
            return response.json({
                success: false,
                message: `Event not found`
            })
        }

        let pricePerTicket = event.price
        let diskonNominal = 0
        let appliedDiskon = null

        if (id_diskon) {
            const diskon = await diskonModel.findOne({
                where: { id_diskon: id_diskon }
            })

            if (!diskon) {
                return response.json({
                    success: false,
                    message: `Discount not found`
                })
            }

            if (new Date(diskon.tanggal_berlaku) < bookedDate) {
                return response.json({
                    success: false,
                    message: `Discount "${diskon.nama_diskon}" has expired (valid until ${diskon.tanggal_berlaku})`
                })
            }

            if (diskon.eventID && Number(diskon.eventID) !== Number(eventID)) {
                return response.json({
                    success: false,
                    message: `Discount "${diskon.nama_diskon}" is not valid for this event`
                })
            }

            diskonNominal = diskon.nominal
            appliedDiskon = diskon.id_diskon
        }

        let finalPrice = pricePerTicket - diskonNominal
        if (finalPrice < 0) finalPrice = 0

        const seatIDs = await Promise.all(seats.map(async seat => {
            const { rowNum, seatNum } = seat;
            const createdSeat = await seatModel.create({
                eventID,
                rowNum,
                seatNum,
                status: true
            });
            return createdSeat.seatID;
        }));

        const tickets = await ticketModel.bulkCreate(seatIDs.map(seatID => ({
            eventID,
            userID,
            seatID,
            id_diskon: appliedDiskon,
            totalPrice: finalPrice,
            bookedDate
        })));

        const grandTotal = finalPrice * seats.length

        return response.status(201).json({
            success: true,
            data: tickets,
            priceDetail: {
                originalPrice: pricePerTicket,
                discount: diskonNominal,
                priceAfterDiscount: finalPrice,
                totalSeats: seats.length,
                grandTotal: grandTotal
            },
            message: appliedDiskon
                ? `Tickets booked successfully with discount applied`
                : `Tickets booked successfully without discount`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function for read all data */
exports.getAllTicket = async(request, response) => {
    try {
        let whereClause = {}
        if (request.user && request.user.role === 'user') {
            const userID = request.user.userID || request.user.id
            whereClause.userID = userID
        }

        let tickets = await ticketModel.findAll({
            where: whereClause,
            include: [
                { model: eventModel, as: 'ticketEvent', attributes: ['eventName', 'eventDate', 'venue', 'price', 'image'] },
                { model: userModel, as: 'ticketUser', attributes: ['firstname', 'lastname', 'email'] },
                { model: seatModel, as: 'ticketSeat', attributes: ['rowNum', 'seatNum'] },
                { model: diskonModel, as: 'ticketDiskon', attributes: ['nama_diskon', 'nominal', 'tanggal_berlaku'] },
            ]
        })
        return response.json({
            success: true,
            data: tickets,
            message: `All tickets have been loaded`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function for filter ticket by Ticket ID */
exports.ticketByID = async(request, response) => {
    try {
        let ticketID = request.params.id

        // Cari tiket berdasarkan ticketID
        let ticket = await ticketModel.findOne({
            where: { ticketID: ticketID },
            include: [
                { model: eventModel, as: 'ticketEvent', attributes: ['eventName', 'eventDate', 'venue', 'price', 'image'] },
                { model: userModel, as: 'ticketUser', attributes: ['firstname', 'lastname', 'email'] },
                { model: seatModel, as: 'ticketSeat', attributes: ['rowNum', 'seatNum'] },
                { model: diskonModel, as: 'ticketDiskon', attributes: ['nama_diskon', 'nominal', 'tanggal_berlaku'] },
            ]
        })

        if (!ticket) {
            return response.json({
                success: false,
                message: `Tiket dengan ID ${ticketID} tidak ditemukan`
            })
        }

        /** Jika user login akun (role user), pastikan hanya bisa lihat miliknya sendiri */
        if (request.user && request.user.role === 'user') {
            const loggedInUserID = request.user.userID || request.user.id
            if (Number(ticket.userID) !== Number(loggedInUserID)) {
                return response.json({
                    success: false,
                    message: `Akses ditolak. Anda hanya dapat melihat tiket milik Anda sendiri.`
                })
            }
        }

        return response.json({
            success: true,
            data: ticket,
            message: `Ticket data loaded successfully`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function for user to see their own ticket purchase history */
exports.getUserTickets = async(request, response) => {
    try {
        let userID = request.params.id || (request.user ? (request.user.userID || request.user.id) : null)

        if (request.user && request.user.role === 'user') {
            const tokenUserID = request.user.userID || request.user.id
            if (request.params.id && Number(request.params.id) !== Number(tokenUserID)) {
                return response.json({
                    success: false,
                    message: `Akses ditolak. Anda hanya dapat melihat tiket milik Anda sendir (kepo banget).`
                })
            }
            userID = tokenUserID
        }

        if (!userID) {
            return response.json({
                success: false,
                message: `User information not found`
            })
        }

        let tickets = await ticketModel.findAll({
            where: { userID: userID },
            include: [
                { model: eventModel, as: 'ticketEvent', attributes: ['eventName', 'eventDate', 'venue', 'price', 'image'] },
                { model: userModel, as: 'ticketUser', attributes: ['firstname', 'lastname', 'email'] },
                { model: seatModel, as: 'ticketSeat', attributes: ['rowNum', 'seatNum'] },
                { model: diskonModel, as: 'ticketDiskon', attributes: ['nama_diskon', 'nominal', 'tanggal_berlaku'] },
            ]
        })

        return response.json({
            success: true,
            data: tickets,
            message: `SELAMAT! Tiket milik user dengan ID ${userID} berhasil dimuat YUHUUUU!!`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function to cancel / delete ticket */
exports.cancelTicket = async(request, response) => {
    try {
        let ticketID = request.params.id

        const ticket = await ticketModel.findOne({
            where: { ticketID: ticketID }
        })

        if (!ticket) {
            return response.json({
                success: false,
                message: `Tiket dengan ID ${ticketID} tidak ditemukan`
            })
        }

        if (request.user && request.user.role === 'user') {
            const loggedInUserID = request.user.userID || request.user.id
            if (Number(ticket.userID) !== Number(loggedInUserID)) {
                return response.json({
                    success: false,
                    message: `Akses ditolak! Anda hanya dapat membatalkan tiket milik Anda sendiri (OJOKS NGEAMAKS).`
                })
            }
        }

        const seatID = ticket.seatID

        await ticketModel.destroy({
            where: { ticketID: ticketID }
        })

        if (seatID) {
            await seatModel.destroy({
                where: { seatID: seatID }
            })
        }

        return response.json({
            success: true,
            message: `Tiket dengan ID ${ticketID} berhasil dibatalkan dan seat terkait telah dihapus dari database yaww`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}