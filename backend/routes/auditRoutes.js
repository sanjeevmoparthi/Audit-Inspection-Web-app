const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const upload = require("../middleware/uploadMiddleware");

/* Create Audit (with documents upload) */
router.post(
  "/",
  upload.array("documents"),  // ✅ important
  auditController.createAudit
);

/* Get Audit by Region */
router.get("/region/:regionId", auditController.getAuditByRegion);




router.put(
  "/:id",
  upload.array("documents"),   // 🔥 VERY IMPORTANT
  auditController.updateAudit
);

/* Delete Audit */
router.delete("/:id", auditController.deleteAudit);

// NEW Routes for PDF download
router.get("/download/region/:regionId", auditController.downloadRegionReport);
router.get("/download/company/:companyId", auditController.downloadCompanyReport);

module.exports = router;