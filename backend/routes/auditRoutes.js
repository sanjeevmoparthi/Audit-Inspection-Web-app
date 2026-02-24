const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");

/* Create Audit */
router.post("/", auditController.createAudit);

/* Get Audit by Region */
router.get("/region/:regionId", auditController.getAuditByRegion);


/* Update Audit */
router.put("/:id", auditController.updateAudit);

/* Delete Audit */
router.delete("/:id", auditController.deleteAudit);

// NEW Routes for PDF download
router.get("/download/region/:regionId", auditController.downloadRegionReport);
router.get("/download/company/:companyId", auditController.downloadCompanyReport);

module.exports = router;