const express = require(`express`)
const app = express()

const eventController = require(`../controllers/event.controller`)
const { authorize } = require(`../controllers/auth.controller`)
const { allowRoles } = require('../middlewares/role-validation')

/**
 * @swagger
 * /event/revenue-stats:
 *   get:
 *     summary: Statistik pendapatan (Admin)
 *     description: Mengembalikan total revenue keseluruhan, total tiket terjual, dan event dengan kontribusi revenue tertinggi. Hanya Admin.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_revenue: { type: number, example: 5000000 }
 *                     total_tickets_sold: { type: integer, example: 50 }
 *                     top_contributor:
 *                       type: object
 *                       properties:
 *                         event_id: { type: integer, example: 1 }
 *                         nama_event: { type: string, example: Konser Malam Minggu }
 *                         revenue_generated: { type: number, example: 3000000 }
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/revenue-stats", authorize, allowRoles('admin'), eventController.getRevenueStats)

/**
 * @swagger
 * /event/sales-stats:
 *   get:
 *     summary: Statistik penjualan per event
 *     description: Mengembalikan semua event beserta jumlah tiket yang terjual (ticketsSold). Admin dan user dapat mengakses.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik penjualan berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Event'
 *                       - type: object
 *                         properties:
 *                           ticketsSold: { type: integer, example: 12 }
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/sales-stats", authorize, allowRoles('admin', 'user'), eventController.getEventSalesStats)

/**
 * @swagger
 * /event/top-selling:
 *   get:
 *     summary: Top 5 event dengan penjualan terbanyak
 *     description: Mengembalikan 5 event yang masih berlangsung (tanggal >= hari ini) dengan penjualan tiket terbanyak. Admin dan user dapat mengakses.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top 5 event berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   maxItems: 5
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Event'
 *                       - type: object
 *                         properties:
 *                           ticketsSold: { type: integer, example: 20 }
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/top-selling", authorize, allowRoles('admin', 'user'), eventController.getTopSellingEvents)

/**
 * @swagger
 * /event/:
 *   get:
 *     summary: Ambil semua event
 *     description: Mengembalikan daftar seluruh event. Admin dan user dapat mengakses.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar event berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   post:
 *     summary: Tambah event baru (Admin)
 *     description: >
 *       Menambahkan event baru beserta gambar cover. Gunakan **form-data** (bukan JSON)
 *       karena menyertakan upload file. Hanya Admin.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [eventName, eventDate, venue, price, image]
 *             properties:
 *               eventName: { type: string, example: Konser Malam Minggu }
 *               eventDate: { type: string, format: date, example: '2026-12-31' }
 *               venue: { type: string, example: Gelora Bung Karno }
 *               price: { type: integer, example: 150000 }
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File gambar cover event
 *     responses:
 *       200:
 *         description: Event berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/", authorize, allowRoles('admin', 'user'), eventController.getAllEvent)
app.post("/", authorize, allowRoles('admin'), eventController.addEvent)

/**
 * @swagger
 * /event/{id}:
 *   put:
 *     summary: Update event (Admin)
 *     description: >
 *       Memperbarui data event. Gunakan **form-data**. Field `image` opsional —
 *       jika diisi, gambar lama akan otomatis dihapus dari disk. Hanya Admin.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID event
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               eventName: { type: string, example: Konser Updated }
 *               eventDate: { type: string, format: date, example: '2027-01-15' }
 *               venue: { type: string, example: Istora Senayan }
 *               price: { type: integer, example: 200000 }
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Opsional — isi jika ingin mengganti gambar
 *     responses:
 *       200:
 *         description: Event berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   delete:
 *     summary: Hapus event (Admin)
 *     description: Menghapus event berdasarkan ID. File gambar terkait juga ikut dihapus dari disk. Hanya Admin.
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID event
 *         example: 1
 *     responses:
 *       200:
 *         description: Event berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/:key", authorize, allowRoles('admin', 'user'), eventController.findEvent)
app.put("/:id", authorize, allowRoles('admin'), eventController.updateEvent)
app.delete("/:id", authorize, allowRoles('admin'), eventController.deleteEvent)

module.exports = app
