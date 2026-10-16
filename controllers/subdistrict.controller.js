const { Subdistrict } = require('../models');
// GET semua data
exports.getAll = async (req, res) => {
  try {
    const data = await Subdistrict.findAll();

    res.status(200).json({
      message: 'Data kecamatan berhasil diambil',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data kecamatan',
      error: error.message
    });
  }
};


// GET berdasarkan ID
exports.getById = async (req, res) => {
  try {
    const data = await Subdistrict.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: 'Data kecamatan tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Detail kecamatan berhasil diambil',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data kecamatan',
      error: error.message
    });
  }
};


// POST tambah data
exports.create = async (req, res) => {
  try {
    const data = await Subdistrict.create({
      subdistrict_id: req.body.subdistrict_id,
      province_id: req.body.province_id,
      province: req.body.province,
      city_id: req.body.city_id,
      city: req.body.city,
      type: req.body.type,
      subdistrict_name: req.body.subdistrict_name
    });

    res.status(201).json({
      message: 'Data kecamatan berhasil ditambahkan',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal menambahkan data kecamatan',
      error: error.message
    });
  }
};


// PUT ubah data
exports.update = async (req, res) => {
  try {
    const data = await Subdistrict.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: 'Data kecamatan tidak ditemukan'
      });
    }

    await data.update({
      subdistrict_id: req.body.subdistrict_id,
      province_id: req.body.province_id,
      province: req.body.province,
      city_id: req.body.city_id,
      city: req.body.city,
      type: req.body.type,
      subdistrict_name: req.body.subdistrict_name
    });

    res.status(200).json({
      message: 'Data kecamatan berhasil diubah',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengubah data kecamatan',
      error: error.message
    });
  }
};


// DELETE hapus data
exports.delete = async (req, res) => {
  try {
    const data = await Subdistrict.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: 'Data kecamatan tidak ditemukan'
      });
    }

    await data.destroy();

    res.status(200).json({
      message: 'Data kecamatan berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal menghapus data kecamatan',
      error: error.message
    });
  }
};