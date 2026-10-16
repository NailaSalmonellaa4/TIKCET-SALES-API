const express = require(`express`)
const cors = require(`cors`)
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

const app = express()
const PORT = 8000

app.use(cors())
app.use(express.json())
app.use(express.text({ type: ['text/plain', 'text/html'] }))
app.use(express.urlencoded({ extended: true }))

/** Swagger UI — tersedia di http://localhost:8000/api-docs */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Tiket Sales API Docs',
    swaggerOptions: {
        persistAuthorization: true,  // token tetap tersimpan setelah refresh
    }
}))

/** Route imports */
const userRoute        = require(`./routes/user.route`)
const eventRoute       = require(`./routes/event.route`)
const seatRoute        = require(`./routes/seat.route`)
const ticketRoute      = require(`./routes/ticket.route`)
const diskonRoute      = require(`./routes/diskon.route`)
const authRoute        = require(`./routes/auth.route`)
const reviewRoute      = require(`./routes/review.routes`)
const subdistrictRoute = require(`./routes/subdistrict.route`)

/** Route mounting */
app.use(`/user`,        userRoute)
app.use(`/event`,       eventRoute)
app.use(`/seat`,        seatRoute)
app.use(`/ticket`,      ticketRoute)
app.use(`/diskon`,      diskonRoute)
app.use(`/auth`,        authRoute)
app.use(`/review`,      reviewRoute)
app.use(`/subdistrict`, subdistrictRoute)

/** Static files (gambar upload) */
app.use(express.static(__dirname))

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`)
})
