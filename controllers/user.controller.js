/** load model for `users` table */
const userModel = require(`../models/index`).user
const md5 = require(`md5`)

/** load Operation from Sequelize */
const Op = require(`sequelize`).Op

/** Ambil semua user */
exports.getAllUser = async (request, response) => {
    let users = await userModel.findAll()
    return response.json({
        success: true,
        data: users,
        message: `All users have been loaded`
    })
}

/** Cari user berdasarkan keyword */
exports.findUser = async (request, response) => {
    let keyword = request.params.key

    let users = await userModel.findAll({
        where: {
            [Op.or]: [
                { userID: { [Op.substring]: keyword } },
                { firstname: { [Op.substring]: keyword } },
                { lastname: { [Op.substring]: keyword } },
                { email: { [Op.substring]: keyword } },
                { role: { [Op.substring]: keyword } }
            ]
        }
    })
    return response.json({
        success: true,
        data: users,
        message: `Users matching "${keyword}" have been loaded`
    })
}

/** Helper internal: buat user baru ke DB */
const createUser = (body) => {
    return userModel.create({
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        password: md5(body.password),
        role: body.role || 'user'
    })
}

/** Tambah user baru (oleh Admin) */
exports.addUser = async (request, response) => {
    if (!request.body || !request.body.password) {
        return response.json({ success: false, message: `Password is required` })
    }
    try {
        const result = await createUser(request.body)
        return response.json({ success: true, data: result, message: `New user has been inserted` })
    } catch (error) {
        return response.json({ success: false, message: error.message })
    }
}

/** Registrasi user baru (public) */
exports.registerUser = async (request, response) => {
    if (!request.body || !request.body.password) {
        return response.json({ success: false, message: `Password is required` })
    }
    try {
        const result = await createUser(request.body)
        return response.json({ success: true, data: result, message: `Registration successful` })
    } catch (error) {
        return response.json({ success: false, message: error.message })
    }
}

/** Update data user */
exports.updateUser = (request, response) => {
    let dataUser = {
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        email: request.body.email,
        role: request.body.role
    }
    if (request.body.password) {
        dataUser.password = md5(request.body.password)
    }

    userModel.update(dataUser, { where: { userID: request.params.id } })
        .then(() => response.json({ success: true, message: `Data user has been updated` }))
        .catch(error => response.json({ success: false, message: error.message }))
}

/** Hapus user */
exports.deleteUser = (request, response) => {
    userModel.destroy({ where: { userID: request.params.id } })
        .then(() => response.json({ success: true, message: `Data user has been deleted` }))
        .catch(error => response.json({ success: false, message: error.message }))
}

/** Reset password user (oleh Admin) */
exports.resetPassword = (request, response) => {
    if (!request.body || !request.body.password) {
        return response.json({ success: false, message: `Password is required` })
    }

    userModel.update(
        { password: md5(request.body.password) },
        { where: { userID: request.params.id } }
    )
        .then(() => response.json({ success: true, message: `Password has been updated` }))
        .catch(error => response.json({ success: false, message: error.message }))
}

/** Ambil profil user berdasarkan ID atau dari token JWT */
exports.getUserProfile = async (request, response) => {
    try {
        let targetUserID = request.params.id || (request.user ? (request.user.userID || request.user.id) : null)

        // User hanya boleh lihat profil sendiri
        if (request.user && request.user.role === 'user') {
            const loggedInUserID = request.user.userID || request.user.id
            if (request.params.id && Number(request.params.id) !== Number(loggedInUserID)) {
                return response.json({
                    success: false,
                    message: `Akses ditolak! Anda hanya dapat melihat profil Anda sendiri.`
                })
            }
            targetUserID = loggedInUserID
        }

        if (!targetUserID) {
            return response.json({ success: false, message: `User ID tidak ditemukan` })
        }

        const foundUser = await userModel.findOne({
            where: { userID: targetUserID },
            attributes: ['userID', 'firstname', 'lastname', 'email', 'role', 'createdAt', 'updatedAt']
        })

        if (!foundUser) {
            return response.json({ success: false, message: `User dengan ID ${targetUserID} tidak ditemukan` })
        }

        return response.json({ success: true, data: foundUser, message: `Data profil user berhasil dimuat` })
    } catch (error) {
        return response.json({ success: false, message: error.message })
    }
}

/** Batalkan tiket — didelegasikan ke ticket controller */
exports.cancelTicket = async (req, res) => {
    const ticketController = require(`./ticket.controller`)
    return ticketController.cancelTicket(req, res)
}
