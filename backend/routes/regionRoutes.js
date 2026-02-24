const express = require("express");
const router = express.Router();

const {
  getRegions,
  getRegion,
  addRegion,
  updateRegion,
  deleteRegion,
} = require("../controllers/regionController");


// Get all regions
router.get("/", getRegions);

// Get regions by branch
router.get("/branch/:branchId", getRegions);

// Get single region
router.get("/:id", getRegion);

// Add region
router.post("/", addRegion);

// Update region
router.put("/:id", updateRegion);

// Delete region
router.delete("/:id", deleteRegion);

module.exports = router;