const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tiket Sales API',
      version: '1.0.0',
      description:
        'Dokumentasi lengkap REST API sistem penjualan tiket. ' +
        'Untuk endpoint yang memerlukan autentikasi, login terlebih dahulu via **POST /auth/** (admin) atau **POST /auth/user** (user), ' +
        'lalu klik tombol **Authorize** di kanan atas dan masukkan token dengan format: `Bearer <token>`',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT token yang didapat dari endpoint login',
        },
      },
      schemas: {
        // ─── AUTH ───────────────────────────────────────────────
        LoginAdminRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        LoginUserRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            logged: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Authentication Success' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        // ─── USER ────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            userID: { type: 'integer', example: 1 },
            firstname: { type: 'string', example: 'Budi' },
            lastname: { type: 'string', example: 'Santoso' },
            email: { type: 'string', example: 'budi@example.com' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UserRequest: {
          type: 'object',
          required: ['firstname', 'lastname', 'email', 'password'],
          properties: {
            firstname: { type: 'string', example: 'Budi' },
            lastname: { type: 'string', example: 'Santoso' },
            email: { type: 'string', format: 'email', example: 'budi@example.com' },
            password: { type: 'string', example: 'password123' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user', description: 'Opsional, default: user' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string', example: 'newpassword123' },
          },
        },
        // ─── EVENT ───────────────────────────────────────────────
        Event: {
          type: 'object',
          properties: {
            eventID: { type: 'integer', example: 1 },
            eventName: { type: 'string', example: 'Konser Malam Minggu' },
            eventDate: { type: 'string', format: 'date', example: '2026-12-31' },
            venue: { type: 'string', example: 'Gelora Bung Karno' },
            price: { type: 'integer', example: 150000 },
            image: { type: 'string', example: 'cover-1785751135614.png' },
          },
        },
        // ─── SEAT ────────────────────────────────────────────────
        Seat: {
          type: 'object',
          properties: {
            seatID: { type: 'integer', example: 1 },
            eventID: { type: 'integer', example: 1 },
            rowNum: { type: 'string', example: 'A' },
            seatNum: { type: 'integer', example: 1 },
            status: { type: 'boolean', example: false, description: 'false = tersedia, true = terisi' },
          },
        },
        SeatRequest: {
          type: 'object',
          required: ['eventID', 'rowNum', 'seatNum'],
          properties: {
            eventID: { type: 'integer', example: 1 },
            rowNum: { type: 'string', example: 'A' },
            seatNum: { type: 'integer', example: 1 },
            status: { type: 'boolean', example: false, description: 'Opsional, default: false' },
          },
        },
        // ─── TICKET ──────────────────────────────────────────────
        Ticket: {
          type: 'object',
          properties: {
            ticketID: { type: 'integer', example: 1 },
            eventID: { type: 'integer', example: 1 },
            userID: { type: 'integer', example: 2 },
            seatID: { type: 'integer', example: 5 },
            id_diskon: { type: 'integer', nullable: true, example: 1 },
            totalPrice: { type: 'number', example: 100000 },
            bookedDate: { type: 'string', format: 'date-time' },
          },
        },
        TicketRequest: {
          type: 'object',
          required: ['eventID', 'seats'],
          properties: {
            eventID: { type: 'integer', example: 1 },
            userID: { type: 'integer', example: 2, description: 'Hanya untuk Admin — user otomatis dari token' },
            seats: {
              type: 'array',
              items: {
                type: 'object',
                required: ['rowNum', 'seatNum'],
                properties: {
                  rowNum: { type: 'string', example: 'A' },
                  seatNum: { type: 'integer', example: 1 },
                },
              },
              example: [{ rowNum: 'A', seatNum: 1 }, { rowNum: 'A', seatNum: 2 }],
            },
            id_diskon: { type: 'integer', nullable: true, example: 1, description: 'Opsional — ID diskon yang akan diterapkan' },
          },
        },
        // ─── DISKON ──────────────────────────────────────────────
        Diskon: {
          type: 'object',
          properties: {
            id_diskon: { type: 'integer', example: 1 },
            nama_diskon: { type: 'string', example: 'Promo Lebaran' },
            nominal: { type: 'integer', example: 50000 },
            tanggal_berlaku: { type: 'string', format: 'date', example: '2027-04-01' },
            eventID: { type: 'integer', nullable: true, example: 1 },
          },
        },
        DiskonRequest: {
          type: 'object',
          required: ['nama_diskon', 'nominal', 'tanggal_berlaku'],
          properties: {
            nama_diskon: { type: 'string', example: 'Promo Lebaran' },
            nominal: { type: 'integer', example: 50000 },
            tanggal_berlaku: { type: 'string', format: 'date', example: '2027-04-01' },
            eventID: { type: 'integer', nullable: true, example: 1, description: 'Opsional — jika diisi, diskon hanya berlaku untuk event ini' },
          },
        },
        // ─── REVIEW ──────────────────────────────────────────────
        Review: {
          type: 'object',
          properties: {
            reviewID: { type: 'integer', example: 1 },
            userID: { type: 'integer', example: 2 },
            eventID: { type: 'integer', example: 1 },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', nullable: true, example: 'Event yang sangat bagus!' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ReviewRequest: {
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', nullable: true, example: 'Event yang sangat bagus!' },
          },
        },
        // ─── SUBDISTRICT ─────────────────────────────────────────
        Subdistrict: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            subdistrict_id: { type: 'string', example: '1' },
            province_id: { type: 'string', example: '11' },
            province: { type: 'string', example: 'Aceh' },
            city_id: { type: 'string', example: '1' },
            city: { type: 'string', example: 'Aceh Barat' },
            type: { type: 'string', example: 'Kabupaten' },
            subdistrict_name: { type: 'string', example: 'Johan Pahlawan' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        SubdistrictRequest: {
          type: 'object',
          required: ['subdistrict_id', 'province_id', 'province', 'city_id', 'city', 'type', 'subdistrict_name'],
          properties: {
            subdistrict_id: { type: 'string', example: '1' },
            province_id: { type: 'string', example: '11' },
            province: { type: 'string', example: 'Aceh' },
            city_id: { type: 'string', example: '1' },
            city: { type: 'string', example: 'Aceh Barat' },
            type: { type: 'string', example: 'Kabupaten' },
            subdistrict_name: { type: 'string', example: 'Johan Pahlawan' },
          },
        },
        // ─── COMMON ──────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
          },
        },
        UnauthorizedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            auth: { type: 'boolean', example: false },
            message: { type: 'string', example: 'User Unauthorized' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autentikasi admin dan user' },
      { name: 'User', description: 'Manajemen data pengguna' },
      { name: 'Event', description: 'Manajemen event / pertunjukan' },
      { name: 'Seat', description: 'Manajemen kursi event' },
      { name: 'Ticket', description: 'Pembelian dan manajemen tiket' },
      { name: 'Diskon', description: 'Manajemen kode diskon' },
      { name: 'Review', description: 'Ulasan event oleh user' },
      { name: 'Subdistrict', description: 'Manajemen data kecamatan / wilayah' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
