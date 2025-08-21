const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const {createDropoff,getDropoffs } = require('../controllers/dropoffController');



// Only Admin can create
router.post("/create", verifyToken, verifyRole(["admin"]), createDropoff);

// Admin & Volunteer can fetch
router.get("/all", verifyToken, getDropoffs);

module.exports = router;
