const express = require(`express`)
const app = express()

const userController = require(`../controllers/user.controller`)
const { authorize } = require('../controllers/auth.controller')
const { allowRoles } = require('../middlewares/role-validation')
const { validateUser } = require('../middlewares/user-validation')

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registrasi user baru
 *     description: Endpoint publik untuk registrasi akun user baru. Tidak memerlukan token.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRequest'
 *     responses:
 *       200:
 *         description: Registrasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message: { type: string, example: Registration successful }
 *       422:
 *         description: Validasi input gagal
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: First Name is required, Invalid email address
 */
app.post("/register", validateUser, userController.registerUser)

/**
 * @swagger
 * /user/:
 *   get:
 *     summary: Ambil semua user
 *     description: Mengembalikan daftar seluruh user yang terdaftar. Hanya dapat diakses oleh Admin.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar user berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 message: { type: string }
 *       401:
 *         description: Token tidak valid atau tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *   post:
 *     summary: Tambah user baru (Admin)
 *     description: Menambahkan user baru oleh Admin. Memerlukan token Admin.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRequest'
 *     responses:
 *       200:
 *         description: User berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message: { type: string, example: New user has been inserted }
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/", authorize, allowRoles('admin'), userController.getAllUser)
app.post("/", authorize, allowRoles('admin'), userController.addUser)

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Ambil profil sendiri
 *     description: Mengembalikan profil user yang sedang login berdasarkan JWT token. Admin dan user bisa mengakses.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message: { type: string }
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/profile", authorize, allowRoles('admin', 'user'), userController.getUserProfile)

/**
 * @swagger
 * /user/profile/{id}:
 *   get:
 *     summary: Ambil profil user berdasarkan ID
 *     description: Admin dapat melihat profil user manapun. User hanya dapat melihat profil miliknya sendiri.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user yang ingin dilihat
 *         example: 1
 *     responses:
 *       200:
 *         description: Profil berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/profile/:id", authorize, allowRoles('admin', 'user'), userController.getUserProfile)

/**
 * @swagger
 * /user/search/{key}:
 *   get:
 *     summary: Cari user berdasarkan keyword
 *     description: Mencari user berdasarkan nama, email, atau role secara substring. Hanya Admin.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *         example: budi
 *     responses:
 *       200:
 *         description: Hasil pencarian berhasil dimuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/search/:key", authorize, allowRoles('admin'), userController.findUser)

/**
 * @swagger
 * /user/reset-password/{id}:
 *   put:
 *     summary: Reset password user (Admin)
 *     description: Mereset password user berdasarkan ID. Hanya Admin.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.put("/reset-password/:id", authorize, allowRoles('admin'), userController.resetPassword)

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update data user (Admin)
 *     description: Memperbarui data user berdasarkan ID. Hanya Admin.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRequest'
 *     responses:
 *       200:
 *         description: User berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 *   delete:
 *     summary: Hapus user (Admin)
 *     description: Menghapus user berdasarkan ID. Hanya Admin.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *         example: 1
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedResponse'
 */
app.get("/:key", authorize, allowRoles('admin'), userController.findUser)
app.put("/:id", authorize, allowRoles('admin'), userController.updateUser)
app.delete("/:id", authorize, allowRoles('admin'), userController.deleteUser)

/**
 * @swagger
 * /user/ticket/cancel/{id}:
 *   delete:
 *     summary: Batalkan tiket (Admin & User)
 *     description: Membatalkan tiket berdasarkan ticketID. Seat terkait juga ikut dihapus dari database.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tiket yang akan dibatalkan
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
app.delete("/ticket/cancel/:id", authorize, allowRoles('admin', 'user'), userController.cancelTicket)

module.exports = app
