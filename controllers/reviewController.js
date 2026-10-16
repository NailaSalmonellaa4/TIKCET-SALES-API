/** load Sequelize models */
const { review: reviewModel, ticket: ticketModel, user: userModel, event: eventModel } = require('../models/index');
const { Op } = require('sequelize');

/**
 * 1. Tambah Ulasan Baru (POST /event/:eventID/review)
 * Hanya user yang sudah pernah beli tiket event ini yang boleh memberi ulasan.
 */
exports.createReview = async (req, res) => {
  const { eventID } = req.params;
  const { rating, comment } = req.body;

  // Ambil userID dari JWT token — konsisten dengan controller lain di project ini
  const userID = req.user.userID || req.user.id;

  try {
    // Validasi rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus diisi antara 1 sampai 5'
      });
    }

    // Cek apakah event ada
    const event = await eventModel.findOne({ where: { eventID } });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    // Cek apakah user pernah beli tiket event ini
    const hasTicket = await ticketModel.findOne({
      where: { userID, eventID }
    });

    if (!hasTicket) {
      return res.status(403).json({
        success: false,
        message: 'Kamu harus membeli tiket event ini terlebih dahulu untuk memberi ulasan'
      });
    }

    // Cek apakah user sudah pernah review event yang sama (1 user = 1 review per event)
    const existingReview = await reviewModel.findOne({ where: { userID, eventID } });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'Kamu sudah pernah memberi ulasan untuk event ini'
      });
    }

    // Simpan ulasan
    const newReview = await reviewModel.create({
      userID,
      eventID,
      rating,
      comment: comment || null
    });

    return res.status(201).json({
      success: true,
      message: 'Ulasan berhasil ditambahkan!',
      data: newReview
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan ulasan',
      error: error.message
    });
  }
};

/**
 * 2. Ambil Semua Ulasan per Event (GET /event/:eventID/reviews)
 * Public — tidak butuh token.
 */
exports.getEventReviews = async (req, res) => {
  const { eventID } = req.params;

  try {
    // Cek apakah event ada
    const event = await eventModel.findOne({ where: { eventID } });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    // Ambil semua review beserta nama reviewer
    const reviews = await reviewModel.findAll({
      where: { eventID },
      include: [
        {
          model: userModel,
          as: 'reviewUser',
          attributes: ['userID', 'firstname', 'lastname', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Hitung rata-rata rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      eventID: parseInt(eventID),
      eventName: event.eventName,
      averageRating,
      totalReviews,
      data: reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil ulasan',
      error: error.message
    });
  }
};

/**
 * 3. Hapus Ulasan (DELETE /review/:reviewID)
 * Hanya pemilik ulasan atau admin yang bisa menghapus.
 */
exports.deleteReview = async (req, res) => {
  const { reviewID } = req.params;

  // Ambil userID dari JWT token — konsisten dengan controller lain
  const userID = req.user.userID || req.user.id;
  const userRole = req.user.role;

  try {
    const existingReview = await reviewModel.findOne({ where: { reviewID } });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan'
      });
    }

    // Admin bisa hapus siapapun, user hanya bisa hapus miliknya sendiri
    if (userRole !== 'admin' && existingReview.userID !== userID) {
      return res.status(403).json({
        success: false,
        message: 'Kamu tidak memiliki akses untuk menghapus ulasan ini'
      });
    }

    await existingReview.destroy();

    return res.status(200).json({
      success: true,
      message: 'Ulasan berhasil dihapus'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus ulasan',
      error: error.message
    });
  }
};
