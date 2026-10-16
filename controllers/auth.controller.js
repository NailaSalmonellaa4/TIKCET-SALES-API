/** load md5 library */
const md5 = require(`md5`)

/** load library jsonwebtoken */
const jwt = require(`jsonwebtoken`)

/** load model of admin */
const adminModel = require(`../models/index`).admin

/** load model of user */
const userModel = require(`../models/index`).user

/** define secret key as signature */
const secret = `mokleters`

/** create function to handle authenticating process as admin */
const authenticate = async(request, response) => {
    if (!request.body || !request.body.username || !request.body.password) {
        return response.json({
            success: false,
            logged: false,
            message: `Username and password are required`
        })
    }

    let dataLogin = {
        username: request.body.username,
        password: md5(request.body.password)
    }

    /** check data username and password on admin's table */
    let dataAdmin = await adminModel.findOne({ where: dataLogin })

    /** if data admin exists */
    if (dataAdmin) {
        let payloadData = {
            ...(dataAdmin.dataValues || dataAdmin),
            role: `admin`
        }

        /** generate token */
        let token = jwt.sign(payloadData, secret)
        return response.json({
            success: true,
            logged: true,
            message: `Authentication Success`,
            token: token,
            data: dataAdmin
        })
    }
    /** if data admin is not exists */
    return response.json({
        success: false,
        logged: false,
        message: `Authentication Failed. Invalid username or password`
    })
}

/** create function to handle authenticating process as user */
const authenticateUser = async(request, response) => {
    if (!request.body || !request.body.email || !request.body.password) {
        return response.json({
            success: false,
            logged: false,
            message: `Email and password are required`
        })
    }

    let dataLogin = {
        email: request.body.email,
        password: md5(request.body.password)
    }

    /** check data email and password on user's table */
    let dataUser = await userModel.findOne({ where: dataLogin })

    /** if data user exists */
    if (dataUser) {
        let userObj = dataUser.dataValues || dataUser
        let payloadData = {
            ...userObj,
            role: userObj.role || `user`
        }

        /** generate token */
        let token = jwt.sign(payloadData, secret)
        return response.json({
            success: true,
            logged: true,
            message: `Authentication Success`,
            token: token,
            data: dataUser
        })
    }
    /** if data user is not exists */
    return response.json({
        success: false,
        logged: false,
        message: `Authentication Failed. Invalid email or password`
    })
}

/** fungsi authorize */
const authorize = (request, response, next) => {
    /** mendapatkan auth dari req header */
    const authHeader = request.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        try {
            /** verify token */
            let verifiedUser = jwt.verify(token, secret);
            if (!verifiedUser) {
                return response.json({
                    success: false,
                    auth: false,
                    message: `User Unauthorized`
                })
            }

            if (typeof verifiedUser === 'string') {
                verifiedUser = JSON.parse(verifiedUser);
            }

            request.user = verifiedUser; 
            next();
        } catch (error) {
            return response.json({
                success: false,
                auth: false,
                message: `Invalid or expired token`
            })
        }
    } else {
        return response.json({
            success: false,
            auth: false,
            message: `User Unauthorized`
        })
    }
}
 /** when using Bearer Token for authorization,
         * we have to split `headers` to get token key.
         * valus of headers = `Bearers tokenKey`
         */
module.exports = { authenticate, authenticateUser, authorize }