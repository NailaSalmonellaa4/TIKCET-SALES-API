/** load Express Validator */
const { validationResult, body } = require(`express-validator`);

/** Middleware validasi input registrasi user */
const validateUser = [
    body('firstname').notEmpty().withMessage('First Name is required'),
    body('lastname').notEmpty().withMessage('Last Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),

    (request, response, next) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            const errMessage = errors.array().map(it => it.msg).join(', ')
            return response.status(422).json({
                success: false,
                message: errMessage
            })
        }
        next();
    }
];

module.exports = { validateUser };
