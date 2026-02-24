const express = require("express");
const router = express.Router();

const {
  getBranchesByCompany,
  getBranchById,
  addBranch,
  updateBranch,
  deleteBranch
} = require("../controllers/branchController");

// Get branches by company
router.get("/company/:companyId", getBranchesByCompany);

// Get single branch
router.get("/:id", getBranchById);

// Add branch
router.post("/", addBranch);

// Update branch
router.put("/:id", updateBranch);

// Delete branch
router.delete("/:id", deleteBranch);

module.exports = router;