const express = require('express');
const router = express.Router();
const {
  getAllCabins,
  createCabin,
  toggleCabinBlock,
  deleteCabin
} = require('../controllers/cabinController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getAllCabins)
  .post(protect, admin, createCabin);

router.route('/:id/block')
  .put(protect, admin, toggleCabinBlock);

router.route('/:id')
  .delete(protect, admin, deleteCabin);

module.exports = router;
