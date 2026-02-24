const Audit = require("../models/Audit");
const Region = require("../models/Region");
const PDFDocument = require("pdfkit");

/* ================================
   CREATE AUDIT (One per Region)
================================ */

exports.createAudit = async (req, res) => {
  try {
    const { companyId, branchId, regionId, options } = req.body;

    // Check if audit already exists for region
    const existing = await Audit.findOne({ regionId });
    if (existing) {
      return res.status(400).json({ message: "Audit already exists for this region" });
    }

    const audit = new Audit({
      companyId,
      branchId,
      regionId,
      options
    });

    await audit.save();

    res.status(201).json(audit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating audit" });
  }
};


/* ================================
   GET AUDIT BY REGION
================================ */

exports.getAuditByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;

    const audit = await Audit.findOne({ regionId});

    if (!audit) {
      return res.status(404).json({ message: "No audit found" });
    }

    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: "Error fetching audit" });
  }
};


/* ================================
   UPDATE AUDIT
================================ */

exports.updateAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const { options } = req.body;

    const audit = await Audit.findByIdAndUpdate(
      id,
      { options },
      { new: true }
    );

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: "Error updating audit" });
  }
};


/* ================================
   DELETE AUDIT
================================ */

exports.deleteAudit = async (req, res) => {
  try {
    const { id } = req.params;

    await Audit.findByIdAndDelete(id);

    res.json({ message: "Audit deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting audit" });
  }
};



/* ================================
   DOWNLOAD REGION REPORT
================================ */
exports.downloadRegionReport = async (req, res) => {
  try {
    const { regionId } = req.params;

    const audit = await Audit.findOne({ regionId })
      .populate("companyId", "name")
      .populate("branchId", "name")
      .populate("regionId", "name");

    if (!audit) {
      return res.status(404).json({
        message: "No audit found for this region",
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true,
    });

    const safeRegionName =
      audit.regionId?.name?.replace(/\s+/g, "_") || "region";

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=region_${safeRegionName}_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // =========================
    // HEADER SECTION
    // =========================
    doc
      .fontSize(22)
      .fillColor("#0A3D62")
      .text("REGION AUDIT REPORT", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Company: ${audit.companyId?.name || "N/A"}`)
      .text(`Branch: ${audit.branchId?.name || "N/A"}`)
      .text(`Region: ${audit.regionId?.name || "N/A"}`)
      .text(`Generated On: ${new Date().toLocaleDateString()}`);

    doc.moveDown(2);

    // =========================
    // OPTIONS SECTION
    // =========================
    if (audit.options && audit.options.length > 0) {
      audit.options.forEach((opt, idx) => {
        // Light background box
        doc
          .rect(doc.x, doc.y, 520, 25)
          .fill("#EAF2F8")
          .stroke();

        doc
          .fillColor("black")
          .fontSize(13)
          .text(`Audit Point ${idx + 1}`, doc.x + 10, doc.y - 18);

        doc.moveDown(2);

        doc
          .fontSize(11)
          .fillColor("#1B4F72")
          .text(`Option Name: ${opt.optionName || "N/A"}`);

        doc
          .fillColor("black")
          .text(`Amount: ${opt.amount || 0}`)
          .text(`Total Amount: ${opt.totalAmount || 0}`)
          .text(
            `Initial Data Requirement: ${
              opt.initialDataRequirement || "N/A"
            }`
          )
          .text(
            `Person Responsible: ${opt.personResponsible || "N/A"}`
          )
          .text(
            `Data Received Status: ${opt.dataReceivedStatus || "N/A"}`
          )
          .text(
            `Additional Details Required: ${
              opt.additionalDetailsRequired || "N/A"
            }`
          )
          .text(`Work Status: ${opt.workStatus || "N/A"}`)
          .text(
            `Queries / Observation: ${
              opt.queriesObservation || "N/A"
            }`
          );

        doc.moveDown();

        // Divider line
        doc
          .moveTo(doc.x, doc.y)
          .lineTo(550, doc.y)
          .strokeColor("#D5D8DC")
          .stroke();

        doc.moveDown(2);
      });
    } else {
      doc.text("No audit points available.");
    }

    // =========================
    // FOOTER PAGE NUMBERS
    // =========================
    const range = doc.bufferedPageRange();

    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          `Page ${i + 1} of ${range.count}`,
          0,
          doc.page.height - 40,
          { align: "center" }
        );
    }

    doc.end();
  } catch (err) {
    console.error("Region PDF Error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating region PDF",
      });
    }
  }
};

/* ================================
   DOWNLOAD COMPANY REPORT
================================ */


exports.downloadCompanyReport = async (req, res) => {
  try {
    const { companyId } = req.params;

    const audits = await Audit.find({ companyId })
      .populate("companyId", "name")
      .populate("branchId", "name")
      .populate("regionId", "name");

    if (!audits.length) {
      return res.status(404).json({
        message: "No audits found for this company",
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true,
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=company_${companyId}_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // =========================
    // HEADER SECTION
    // =========================
    doc
      .fontSize(22)
      .fillColor("#0A3D62")
      .text("COMPANY AUDIT REPORT", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Company: ${audits[0].companyId?.name || "N/A"}`, {
        align: "left",
      });

    doc.text(`Generated On: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);

    // =========================
    // AUDIT LOOP
    // =========================
    audits.forEach((audit, idx) => {
      // Branch + Region Header Box
      doc
        .rect(doc.x, doc.y, 520, 25)
        .fill("#EAF2F8")
        .stroke();

      doc
        .fillColor("black")
        .fontSize(13)
        .text(
          `Branch: ${audit.branchId?.name || "N/A"}   |   Region: ${
            audit.regionId?.name || "N/A"
          }`,
          doc.x + 10,
          doc.y - 18
        );

      doc.moveDown(2);

      if (audit.options && audit.options.length > 0) {
        audit.options.forEach((opt, i) => {
          doc
            .fontSize(12)
            .fillColor("#1B4F72")
            .text(`Audit Point ${i + 1}`, { underline: true });

          doc.moveDown(0.5);

          doc
            .fillColor("black")
            .fontSize(11)
            .text(`Option Name: ${opt.optionName || "N/A"}`)
            .text(`Amount: ${opt.amount || 0}`)
            .text(`Total Amount: ${opt.totalAmount || 0}`)
            .text(
              `Initial Data Requirement: ${
                opt.initialDataRequirement || "N/A"
              }`
            )
            .text(
              `Person Responsible: ${opt.personResponsible || "N/A"}`
            )
            .text(
              `Data Received Status: ${opt.dataReceivedStatus || "N/A"}`
            )
            .text(
              `Additional Details Required: ${
                opt.additionalDetailsRequired || "N/A"
              }`
            )
            .text(`Work Status: ${opt.workStatus || "N/A"}`)
            .text(
              `Queries / Observation: ${
                opt.queriesObservation || "N/A"
              }`
            );

          doc.moveDown();
          doc
            .moveTo(doc.x, doc.y)
            .lineTo(550, doc.y)
            .strokeColor("#D5D8DC")
            .stroke();

          doc.moveDown();
        });
      } else {
        doc.text("No audit points available.");
      }

      // Avoid extra page at end
      if (idx !== audits.length - 1) {
        doc.addPage();
      }
    });

    // =========================
    // FOOTER (Page Numbers)
    // =========================
    const range = doc.bufferedPageRange();

    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          `Page ${i + 1} of ${range.count}`,
          0,
          doc.page.height - 40,
          { align: "center" }
        );
    }

    doc.end();
  } catch (err) {
    console.error("PDF Error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating company PDF",
      });
    }
  }
};