const express = require("express");
const { getCompanies,getCompanyById, addCompany ,updateCompany,deleteCompany}  = require("../controllers/companyController.js");

const router = express.Router();

router.get("/", getCompanies);
router.get("/:id",getCompanyById);
router.post("/", addCompany);
router.put("/:id",updateCompany);
router.delete("/:id",deleteCompany);


module.exports = router;

