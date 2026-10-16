/** load model for `diskons` table */
const diskonModel = require(`../models/index`).diskon
const eventModel = require(`../models/index`).event

/** load Operation from Sequelize */
const Op = require(`sequelize`).Op

/** create function for read all data */
exports.getAllDiskon = async (request, response) => {
    try {
        let diskons = await diskonModel.findAll({
            include: [
                {
                    model: eventModel,
                    as: 'diskonEvent',
                    attributes: ['eventID', 'eventName', 'price']
                }
            ]
        })
        return response.json({
            success: true,
            data: diskons,
            message: `All discounts have been loaded`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function for find diskon by keyword */
exports.findDiskon = async (request, response) => {
    let keyword = request.params.key

    try {
        let diskons = await diskonModel.findAll({
            where: {
                [Op.or]: [
                    { nama_diskon: { [Op.substring]: keyword } },
                    { nominal: { [Op.substring]: keyword } }
                ]
            },
            include: [
                {
                    model: eventModel,
                    as: 'diskonEvent',
                    attributes: ['eventID', 'eventName', 'price']
                }
            ]
        })
        return response.json({
            success: true,
            data: diskons,
            message: `Discounts have been loaded`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function to add new diskon */
exports.addDiskon = async (request, response) => {
    try {
        if (!request.body || Object.keys(request.body).length === 0) {
            return response.json({
                success: false,
                message: `Request body is empty or invalid JSON. Please ensure Content-Type is application/json.`
            })
        }

        let newDiskon = {
            nama_diskon: request.body.nama_diskon,
            nominal: request.body.nominal,
            tanggal_berlaku: request.body.tanggal_berlaku,
            eventID: request.body.eventID || null
        }

        let result = await diskonModel.create(newDiskon)
        return response.json({
            success: true,
            data: result,
            message: `New discount has been created`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function to update diskon */
exports.updateDiskon = async (request, response) => {
    try {
        let id_diskon = request.params.id

        let dataDiskon = {
            nama_diskon: request.body.nama_diskon,
            nominal: request.body.nominal,
            tanggal_berlaku: request.body.tanggal_berlaku,
            eventID: request.body.eventID || null
        }

        await diskonModel.update(dataDiskon, {
            where: { id_diskon: id_diskon }
        })

        return response.json({
            success: true,
            message: `Discount has been updated`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}

/** create function to delete diskon */
exports.deleteDiskon = async (request, response) => {
    try {
        let id_diskon = request.params.id

        await diskonModel.destroy({
            where: { id_diskon: id_diskon }
        })

        return response.json({
            success: true,
            message: `Discount has been deleted`
        })
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        })
    }
}
