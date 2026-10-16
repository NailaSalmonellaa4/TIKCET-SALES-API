const seatModel = require(`../models/index`).seat;
const eventModel = require(`../models/index`).event;
const ticketModel = require(`../models/index`).ticket;
const Op = require(`sequelize`).Op;

/** create function for read all data */
exports.getAllSeat = async(request, response) => {
    try {
        let seats = await seatModel.findAll({
            include: [{
                model: eventModel,
                as: 'seatEvent',
                attributes: ['eventName', 'eventDate', 'venue']
            }]
        });
        return response.json({
            success: true,
            data: seats,
            message: `All seats have been loaded`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

/** create function for filter */
exports.findSeat = async(request, response) => {
    let keyword = request.params.key;
    try {
        let seats = await seatModel.findAll({
            where: {
                [Op.or]: [{
                        rowNum: {
                            [Op.substring]: keyword
                        }
                    },
                    {
                        seatNum: {
                            [Op.substring]: keyword
                        }
                    },
                    {
                        status: {
                            [Op.substring]: keyword
                        }
                    }
                ]
            },
            include: [{
                model: eventModel,
                as: 'seatEvent',
                attributes: ['eventName', 'eventDate', 'venue']
            }]
        });
        return response.json({
            success: true,
            data: seats,
            message: `Seats have been loaded based on keyword`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

/** create function for add new seat */
exports.addSeat = async(request, response) => {
    try {
        let newSeat = {
            eventID: request.body.eventID,
            rowNum: request.body.rowNum,
            seatNum: request.body.seatNum,
            status: request.body.status || false
        };

        let result = await seatModel.create(newSeat);
        return response.json({
            success: true,
            data: result,
            message: `New seat has been inserted`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

/** create function for update seat */
exports.updateSeat = async(request, response) => {
    try {
        let seatID = request.params.id;
        let dataSeat = {
            eventID: request.body.eventID,
            rowNum: request.body.rowNum,
            seatNum: request.body.seatNum,
            status: request.body.status
        };

        await seatModel.update(dataSeat, {
            where: { seatID: seatID }
        });
        return response.json({
            success: true,
            message: `Seat data has been updated`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

/** create function for delete seat */
exports.deleteSeat = async(request, response) => {
    try {
        let seatID = request.params.id;

        // Check if seat is associated with any ticket
        const associatedTickets = await ticketModel.count({
            where: { seatID: seatID }
        });

        if (associatedTickets > 0) {
            return response.json({
                success: false,
                message: `Cannot delete seat. It is associated with existing tickets.`
            });
        }

        await seatModel.destroy({
            where: { seatID: seatID }
        });
        return response.json({
            success: true,
            message: `Seat data has been deleted`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

/** create function for getting seats by event ID */
exports.getSeatByEvent = async(request, response) => {
    try {
        let eventID = request.params.eventID;

        let seats = await seatModel.findAll({
            where: { eventID: eventID },
            include: [{
                model: eventModel,
                as: 'seatEvent',
                attributes: ['eventName', 'eventDate', 'venue', 'price']
            }]
        });

        return response.json({
            success: true,
            data: seats,
            message: `Seats for event ID ${eventID} have been loaded`
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};