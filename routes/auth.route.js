const express = require(`express`)
const app = express()

const { authenticate, authenticateUser } = require(`../controllers/auth.controller`)

/**
 * @swagger
 * /auth/:
 *   post:
 *     summary: Login Admin
 *     description: Autentikasi sebagai admin menggunakan username dan password. Mengembalikan JWT token dengan role 'admin'.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginAdminRequest'
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               logged: true
 *               message: Authentication Success
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       200_failed:
 *         description: Login gagal (kredensial salah)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               logged: false
 *               message: Authentication Failed. Invalid username or password
 */
app.post("/", authenticate)

/**
 * @swagger
 * /auth/user:
 *   post:
 *     summary: Login User
 *     description: Autentikasi sebagai user menggunakan email dan password. Mengembalikan JWT token dengan role 'user'.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserRequest'
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       200_failed:
 *         description: Login gagal
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               logged: false
 *               message: Authentication Failed. Invalid email or password
 */
app.post("/user", authenticateUser)

module.exports = app
