/** load model for `events` table */
const eventModel = require(`../models/index`).event
const ticketModel = require(`../models/index`).ticket
const { sequelize } = require(`../models/index`)

/** load Operation from Sequelize */
const Op = require(`sequelize`).Op

/** load function from `upload-image` */
const upload = require(`./upload-image`).single(`image`)

/** load library 'path' and 'filestream' */
const path = require(`path`)
const fs = require(`fs`)

/** 1. Read All Data */
exports.getAllEvent = async (request, response) => {
    let events = await eventModel.findAll()
    return response.json({
        success: true,
        data: events,
        message: `All Events have been loaded`
    })
}

/** 2. Filter Event */
exports.findEvent = async (request, response) => {
    let keyword = request.params.key

    let events = await eventModel.findAll({
        where: {
            [Op.or]: [
                { eventName: { [Op.substring]: keyword } },
                { eventDate: { [Op.substring]: keyword } },
                { venue: { [Op.substring]: keyword } },
                { price: { [Op.substring]: keyword } }
            ]
        }
    })
    return response.json({
        success: true,
        data: events,
        message: `All Events have been loaded`
    })
}

/** 3. Add New Event */
exports.addEvent = (request, response) => {
    upload(request, response, async error => {
        if (error) {
            return response.json({
                success: false,
                message: error.message || error
            })
        }

        if (!request.file) {
            return response.json({
                success: false,
                message: `Nothing to Upload`
            })
        }

        let newEvent = {
            eventName: request.body.eventName,
            eventDate: request.body.eventDate,
            venue: request.body.venue,
            price: request.body.price,
            image: request.file.filename
        }

        eventModel.create(newEvent)
        .then(result => {
            return response.json({
                success: true,
                data: result,
                message: `New event has been inserted`
            })
        })
        .catch(error => {
            return response.json({
                success: false,
                message: error.message
            })
        })
    })
}

/** 4. Update Event */
exports.updateEvent = async (request, response) => {
    upload(request, response, async error => {
        if (error) { 
            return response.json({
                success: false,
                message: error.message || error
            })
        }

        let eventID = request.params.id

        let dataEvent = {
            eventName: request.body.eventName,
            eventDate: request.body.eventDate,
            venue: request.body.venue,
            price: request.body.price,
        }

        if (request.file) {
            const selectedEvent = await eventModel.findOne({
                where: { eventID: eventID }
            })

            if (selectedEvent && selectedEvent.image) {
                const oldImage = selectedEvent.image
                const pathImage = path.join(__dirname, `../image`, oldImage)

                if (fs.existsSync(pathImage)) {
                    fs.unlink(pathImage, error => console.log(error))
                }
            }

            dataEvent.image = request.file.filename    
        }

        eventModel.update(dataEvent, { where: { eventID : eventID } })
            .then(result => {
                return response.json({
                    success: true,
                    message: `Data event has been updated`
                })
            })
            .catch(error => {
                return response.json({
                    success: false,
                    message: error.message
                })
            })
    })
}

/** 5. Delete Event */
exports.deleteEvent = async (request, response) => {
    const eventID = request.params.id

    const event = await eventModel.findOne({ where: { eventID: eventID } })
    if (!event) {
        return response.json({
            success: false,
            message: `Event not found`
        })
    }

    if (event.image) {
        const oldImage = event.image
        const pathImage = path.join(__dirname, `../image`, oldImage)

        if (fs.existsSync(pathImage)) {
            fs.unlink(pathImage, error => console.log(error))
        }
    }

    eventModel.destroy({ where: { eventID: eventID } })
        .then(result => {
            return response.json({
                success: true,
                message: `Data event has been deleted`
            })
        })
        .catch(error => {
            return response.json({
                success: false,
                message: error.message
            })
        })
}

/** 6. Sales Stats per Event */
exports.getEventSalesStats = async (request, response) => {
    try {
        const events = await eventModel.findAll({
            attributes: [
                'eventID',
                'eventName',
                'eventDate',
                'venue',
                'price',
                'image',
                [sequelize.fn('COUNT', sequelize.col('eventTicket.ticketID')), 'ticketsSold']
            ],
            include: [{
                model: ticketModel,
                as: 'eventTicket',
                attributes: []
            }],
            group: ['event.eventID', 'event.eventName', 'event.eventDate', 'event.venue', 'event.price', 'event.image'],
            subQuery: false
        })

        return response.json({
            success: true,
            data: events,
            message: `Jumlah tiket terjual untuk masing-masing event berhasil dimuat`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** 7. Top 5 Selling Events */
exports.getTopSellingEvents = async (request, response) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const topEvents = await eventModel.findAll({
            where: {
                eventDate: {
                    [Op.gte]: today
                }
            },
            attributes: [
                'eventID',
                'eventName',
                'eventDate',
                'venue',
                'price',
                'image',
                [sequelize.fn('COUNT', sequelize.col('eventTicket.ticketID')), 'ticketsSold']
            ],
            include: [{
                model: ticketModel,
                as: 'eventTicket',
                attributes: []
            }],
            group: ['event.eventID', 'event.eventName', 'event.eventDate', 'event.venue', 'event.price', 'event.image'],
            order: [[sequelize.literal('ticketsSold'), 'DESC']],
            limit: 5,
            subQuery: false
        })

        return response.json({
            success: true,
            data: topEvents,
            message: `Top 5 event berlangsung dengan penjualan terbanyak berhasil dimuat`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** 8. Laporan Pendapatan Total (DENGAN ALIAS RELASI TICKETEVENT) */
exports.getRevenueStats = async (request, response) => {
    try {
        const tickets = await ticketModel.findAll({
            include: [{
                model: eventModel,
                as: 'ticketEvent',
                attributes: ['eventID', 'eventName', 'price']
            }],
            raw: true,
            nest: true
        });

        let totalRevenue = 0;
        const eventRevenueMap = {};

        tickets.forEach(ticket => {
            const ticketPrice = parseFloat(ticket.ticketEvent?.price || 0);
            const eventID = ticket.ticketEvent?.eventID || ticket.eventID;
            const eventName = ticket.ticketEvent?.eventName || 'Unknown Event';

            totalRevenue += ticketPrice;

            if (!eventRevenueMap[eventID]) {
                eventRevenueMap[eventID] = {
                    event_id: eventID,
                    nama_event: eventName,
                    revenue_generated: 0
                };
            }
            eventRevenueMap[eventID].revenue_generated += ticketPrice;
        });

        const topContributor = Object.values(eventRevenueMap).sort((a, b) => b.revenue_generated - a.revenue_generated)[0] || null;

        return response.json({
            success: true,
            data: {
                total_revenue: totalRevenue,
                total_tickets_sold: tickets.length,
                top_contributor: topContributor
            },
            message: 'Laporan pendapatan berhasil dimuat'
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};