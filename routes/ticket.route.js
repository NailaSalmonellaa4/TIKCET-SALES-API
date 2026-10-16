const express = require(`express`)
const app = express()

const ticketController = require(`../controllers/ticket.controller`)
const { authorize } = require(`../controllers/auth.controller`)
const { allowRoles } = require('../middlewares/role-validation')

/**
 * @swagger
 * /ticket/:
 *   post:
 *     summary: Beli tiket
 *     description: >
 *       Membeli tiket untuk satu atau beberapa kursi sekaligus. 
 *       
 *       **Untuk User:** `userID` otomatis diambil dari token JWT, tidak perlu diisi.
 *       
 *       **Untuk Admin:** bisa menentukan `userID` untuk memesan atas nama user lain.
 *       
 *       Sistem otomatis membuat record seat di tabel seats untuk setiap kursi yang dipesan.
 *       Field `id_diskon` opsional — jika diisi, diskon akan divalidasi (tidak expired, sesuai event) dan diterapkan ke harga.
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketRequest'
 *           examples:
 *             user_tanpa_diskon:
 *               summary: Pembelian oleh User (tanpa diskon)
 *               value:
 *                 eventID: 1
 *                 seats:
 *                   - rowNum: "A"
 *                     seatNum: 1
 *                   - rowNum: "A"
 *                     seatNum: 2
 *             admin_dengan_diskon:
 *               summary: Pembelian oleh Admin (dengan diskon)
 *               value:
 *                 eventID: 1
 *                 userID: 2
 *                 seats:
 *                   - rowNum: "B"
 *                     seatNum: 3
 *                 id_diskon: 1
 *     responses:
 *       201:
 *         description: Tiket berhasil dibeli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 priceDetail:
 *                   type: object
 *                   properties:
 *                     originalPrice: { type: integer, example: 150000 }
 *                     discount: { type: integer, example: 50000 }
 *                     priceAfterDiscount: { type: integer, example: 100000 }
 *                     totalSeats: { type: integer, example: 2 }
 *                     grandTotal: { type: integer, example: 200000 }
 *                 message: { type: string }
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   get:
 *     summary: Ambil semua tiket
 *     description: >
 *       **Admin:** melihat semua tiket dari semua user.
 *       
 *       **User:** hanya melihat tiket miliknya sendiri (filter otomatis dari token JWT).
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data tiket berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.post("/", authorize, allowRoles('admin', 'user'), ticketController.addTicket)
app.get("/", authorize, allowRoles('admin', 'user'), ticketController.getAllTicket)

/**
 * @swagger
 * /ticket/user/{id}:
 *   get:
 *     summary: Ambil tiket berdasarkan user ID
 *     description: >
 *       Riwayat pembelian tiket untuk user tertentu.
 *       User hanya dapat melihat tiket miliknya sendiri (ID di URL divalidasi vs token JWT).
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *         example: 2
 *     responses:
 *       200:
 *         description: Riwayat tiket berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/user/:id", authorize, allowRoles('admin', 'user'), ticketController.getUserTickets)

/**
 * @swagger
 * /ticket/cancel/{id}:
 *   delete:
 *     summary: Batalkan tiket (Admin)
 *     description: Membatalkan tiket berdasarkan ticketID. Record seat terkait juga ikut dihapus dari database. Hanya Admin.
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tiket yang dibatalkan
 *         example: 1
 *     responses:
 *       200:
 *         description: Tiket berhasil dibatalkan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.delete("/cancel/:id", authorize, allowRoles('admin'), ticketController.cancelTicket)

/**
 * @swagger
 * /ticket/{id}:
 *   get:
 *     summary: Ambil detail tiket berdasarkan ticket ID
 *     description: Mengembalikan detail tiket berdasarkan ticketID. User hanya dapat melihat tiket miliknya sendiri.
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tiket
 *         example: 1
 *     responses:
 *       200:
 *         description: Detail tiket berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/:id", authorize, allowRoles('admin', 'user'), ticketController.ticketByID)

module.exports = app
