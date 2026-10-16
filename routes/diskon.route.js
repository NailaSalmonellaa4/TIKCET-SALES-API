const express = require(`express`)
const app = express()

const diskonController = require(`../controllers/diskon.controller`)
const { authorize } = require('../controllers/auth.controller')
const { allowRoles } = require('../middlewares/role-validation')

/**
 * @swagger
 * /diskon/:
 *   get:
 *     summary: Ambil semua diskon
 *     description: Mengembalikan seluruh data diskon beserta informasi event yang terkait. Admin dan user dapat mengakses.
 *     tags: [Diskon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data diskon berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Diskon'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   post:
 *     summary: Tambah diskon baru (Admin)
 *     description: >
 *       Menambahkan diskon baru. Field `eventID` opsional — 
 *       jika diisi, diskon hanya berlaku untuk event tersebut.
 *       `tanggal_berlaku` adalah tanggal kadaluarsa diskon. Hanya Admin.
 *     tags: [Diskon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiskonRequest'
 *     responses:
 *       200:
 *         description: Diskon berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Diskon'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/", authorize, allowRoles('admin', 'user'), diskonController.getAllDiskon)
app.post("/", authorize, allowRoles('admin'), diskonController.addDiskon)

/**
 * @swagger
 * /diskon/{id}:
 *   put:
 *     summary: Update diskon (Admin)
 *     description: Memperbarui data diskon berdasarkan id_diskon. Hanya Admin.
 *     tags: [Diskon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID diskon (id_diskon)
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiskonRequest'
 *     responses:
 *       200:
 *         description: Diskon berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   delete:
 *     summary: Hapus diskon (Admin)
 *     description: Menghapus diskon berdasarkan id_diskon. Hanya Admin.
 *     tags: [Diskon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID diskon (id_diskon)
 *         example: 1
 *     responses:
 *       200:
 *         description: Diskon berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/:key", authorize, allowRoles('admin', 'user'), diskonController.findDiskon)
app.put("/:id", authorize, allowRoles('admin'), diskonController.updateDiskon)
app.delete("/:id", authorize, allowRoles('admin'), diskonController.deleteDiskon)

module.exports = app
