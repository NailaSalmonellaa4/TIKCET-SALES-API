const express = require(`express`)
const app = express()

const seatController = require(`../controllers/seat.controller`)
const { authorize } = require('../controllers/auth.controller')
const { allowRoles } = require('../middlewares/role-validation')

/**
 * @swagger
 * /seat/event/{eventID}:
 *   get:
 *     summary: Ambil semua seat berdasarkan event
 *     description: Mengembalikan semua kursi untuk suatu event beserta informasi event-nya. Admin dan user dapat mengakses.
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID event
 *         example: 1
 *     responses:
 *       200:
 *         description: Data seat berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Seat'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/event/:eventID", authorize, allowRoles('admin', 'user'), seatController.getSeatByEvent)

/**
 * @swagger
 * /seat/:
 *   get:
 *     summary: Ambil semua seat
 *     description: Mengembalikan seluruh data kursi. Admin dan user dapat mengakses.
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data seat berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Seat'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   post:
 *     summary: Tambah seat baru (Admin)
 *     description: Menambahkan seat/kursi baru untuk suatu event. Hanya Admin.
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeatRequest'
 *     responses:
 *       200:
 *         description: Seat berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Seat'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/", authorize, allowRoles('admin', 'user'), seatController.getAllSeat)
app.post("/", authorize, allowRoles('admin'), seatController.addSeat)

/**
 * @swagger
 * /seat/{id}:
 *   put:
 *     summary: Update seat (Admin)
 *     description: Memperbarui data seat berdasarkan seatID. Hanya Admin.
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID seat
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeatRequest'
 *     responses:
 *       200:
 *         description: Seat berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   delete:
 *     summary: Hapus seat (Admin)
 *     description: Menghapus seat berdasarkan seatID. Akan ditolak jika seat masih direferensikan oleh tiket yang ada. Hanya Admin.
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID seat
 *         example: 1
 *     responses:
 *       200:
 *         description: Seat berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Seat masih digunakan oleh tiket
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Seat masih digunakan oleh tiket dan tidak bisa dihapus
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/:key", authorize, allowRoles('admin', 'user'), seatController.findSeat)
app.put("/:id", authorize, allowRoles('admin'), seatController.updateSeat)
app.delete("/:id", authorize, allowRoles('admin'), seatController.deleteSeat)

module.exports = app
