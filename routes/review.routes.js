const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')
const { authorize } = require('../controllers/auth.controller')
const { allowRoles } = require('../middlewares/role-validation')

/**
 * @swagger
 * /review/event/{eventID}/review:
 *   post:
 *     summary: Buat ulasan untuk event
 *     description: >
 *       Menambahkan ulasan untuk event tertentu. Syarat:
 *       
 *       - User harus login (memerlukan token)
 *       
 *       - User harus sudah pernah membeli tiket event ini
 *       
 *       - Setiap user hanya dapat memberikan 1 ulasan per event
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID event yang akan diulas
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewRequest'
 *     responses:
 *       201:
 *         description: Ulasan berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Ulasan berhasil ditambahkan! }
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Rating tidak valid
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Rating harus diisi antara 1 sampai 5
 *       403:
 *         description: User belum membeli tiket atau sudah pernah review
 *         content:
 *           application/json:
 *             examples:
 *               belum_beli:
 *                 value:
 *                   success: false
 *                   message: Kamu harus membeli tiket event ini terlebih dahulu untuk memberi ulasan
 *               sudah_review:
 *                 value:
 *                   success: false
 *                   message: Kamu sudah pernah memberi ulasan untuk event ini
 *       404:
 *         description: Event tidak ditemukan
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
router.post('/event/:eventID/review', authorize, allowRoles('admin', 'user'), reviewController.createReview)

/**
 * @swagger
 * /review/event/{eventID}/reviews:
 *   get:
 *     summary: Ambil semua ulasan event
 *     description: Mengembalikan semua ulasan untuk event tertentu beserta rata-rata rating dan jumlah ulasan. Endpoint publik — tidak memerlukan token.
 *     tags: [Review]
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
 *         description: Ulasan berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 eventID: { type: integer, example: 1 }
 *                 eventName: { type: string, example: Konser Malam Minggu }
 *                 averageRating: { type: number, example: 4.5 }
 *                 totalReviews: { type: integer, example: 10 }
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Review'
 *                       - type: object
 *                         properties:
 *                           reviewUser:
 *                             type: object
 *                             properties:
 *                               userID: { type: integer, example: 2 }
 *                               firstname: { type: string, example: Budi }
 *                               lastname: { type: string, example: Santoso }
 *       404:
 *         description: Event tidak ditemukan
 */
router.get('/event/:eventID/reviews', reviewController.getEventReviews)

/**
 * @swagger
 * /review/review/{reviewID}:
 *   delete:
 *     summary: Hapus ulasan
 *     description: >
 *       Menghapus ulasan berdasarkan reviewID.
 *       
 *       - **User:** hanya dapat menghapus ulasan miliknya sendiri
 *       
 *       - **Admin:** dapat menghapus ulasan siapapun
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ulasan yang akan dihapus
 *         example: 1
 *     responses:
 *       200:
 *         description: Ulasan berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Tidak memiliki akses untuk menghapus ulasan ini
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Kamu tidak memiliki akses untuk menghapus ulasan ini
 *       404:
 *         description: Ulasan tidak ditemukan
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
router.delete('/review/:reviewID', authorize, allowRoles('admin', 'user'), reviewController.deleteReview)

module.exports = router
