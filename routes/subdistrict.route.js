const express = require('express');
const router = express.Router();
const subdistrictController = require('../controllers/subdistrict.controller');

/**
 * @swagger
 * /subdistrict:
 *   get:
 *     summary: Ambil semua data subdistrict / kecamatan
 *     description: Mengembalikan seluruh data kecamatan / wilayah.
 *     tags: [Subdistrict]
 *     responses:
 *       200:
 *         description: Data kecamatan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Data kecamatan berhasil diambil' }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subdistrict'
 *       500:
 *         description: Gagal mengambil data kecamatan
 */
router.get('/', subdistrictController.getAll);

/**
 * @swagger
 * /subdistrict/{id}:
 *   get:
 *     summary: Ambil detail subdistrict berdasarkan ID
 *     description: Mengembalikan satu data kecamatan berdasarkan ID primary key.
 *     tags: [Subdistrict]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID primary key kecamatan
 *         example: 1
 *     responses:
 *       200:
 *         description: Detail kecamatan berhasil diambil
 *       404:
 *         description: Data kecamatan tidak ditemukan
 *       500:
 *         description: Gagal mengambil data kecamatan
 */
router.get('/:id', subdistrictController.getById);

/**
 * @swagger
 * /subdistrict:
 *   post:
 *     summary: Tambah data subdistrict baru
 *     description: Menambahkan satu data kecamatan baru.
 *     tags: [Subdistrict]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubdistrictRequest'
 *     responses:
 *       201:
 *         description: Data kecamatan berhasil ditambahkan
 *       500:
 *         description: Gagal menambahkan data kecamatan
 */
router.post('/', subdistrictController.create);

/**
 * @swagger
 * /subdistrict/{id}:
 *   put:
 *     summary: Update data subdistrict berdasarkan ID
 *     description: Mengubah data kecamatan berdasarkan ID primary key.
 *     tags: [Subdistrict]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID primary key kecamatan
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubdistrictRequest'
 *     responses:
 *       200:
 *         description: Data kecamatan berhasil diubah
 *       404:
 *         description: Data kecamatan tidak ditemukan
 *       500:
 *         description: Gagal mengubah data kecamatan
 */
router.put('/:id', subdistrictController.update);

/**
 * @swagger
 * /subdistrict/{id}:
 *   delete:
 *     summary: Hapus data subdistrict berdasarkan ID
 *     description: Menghapus data kecamatan berdasarkan ID primary key.
 *     tags: [Subdistrict]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID primary key kecamatan
 *         example: 1
 *     responses:
 *       200:
 *         description: Data kecamatan berhasil dihapus
 *       404:
 *         description: Data kecamatan tidak ditemukan
 *       500:
 *         description: Gagal menghapus data kecamatan
 */
router.delete('/:id', subdistrictController.delete);

module.exports = router;
