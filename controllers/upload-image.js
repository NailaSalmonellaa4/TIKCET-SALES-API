const multer = require('multer')
const fs = require('fs')
const path = require('path')

const imageDir = path.join(__dirname, '../image')
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDir)
    },
    filename: (req, file, cb) => {
        cb(null, `cover-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // Max size 1 MB
    fileFilter: (req, file, cb) => {
        const acceptedType = [`image/jpg`, `image/jpeg`, `image/png`]
        if (!acceptedType.includes(file.mimetype)) {
            return cb(new Error(`Invalid file type (${file.mimetype})`), false)
        }
        cb(null, true)
    }
})

module.exports = upload