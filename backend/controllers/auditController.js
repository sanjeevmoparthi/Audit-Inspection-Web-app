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
      return res.status(404).json({ message: "No audit found for this region" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });

    const safeRegionName = audit.regionId?.name?.replace(/\s+/g, "_") || "region";

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=region_${safeRegionName}_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // =========================
    // HEADER
    // =========================
    doc.rect(0, 0, doc.page.width, 80).fill("#0A3D62");
    doc.fillColor("white").fontSize(22).text("REGION AUDIT REPORT", 0, 30, { align: "center" });
    doc.moveDown(2);

    doc.fillColor("black").fontSize(12)
      .text(`Company: ${audit.companyId?.name || "N/A"}`)
      .moveDown(1)
      .text(`Branch: ${audit.branchId?.name || "N/A"}`)
      .moveDown(1)
      .text(`Region: ${audit.regionId?.name || "N/A"}`)
      .moveDown(1)
      .text(`Generated On: ${new Date().toLocaleDateString()}`)
      .moveDown(2);

    // =========================
    // AUDIT OPTIONS LOOP
    // =========================
    if (audit.options && audit.options.length > 0) {
      audit.options.forEach((opt, idx) => {
        const startX = doc.x;
        const startY = doc.y;
        const contentGap = 5; // gap inside the box
        const fieldGap = 4; // space between lines
        let currentY = startY + contentGap;

        // Draw each field dynamically
        const drawField = (label, value) => {
          const maxWidth = 520 - 2 * contentGap;
          const textHeight = doc.heightOfString(`${label}: ${value || "N/A"}`, { width: maxWidth });

          doc.font("Helvetica-Bold").fillColor("black").text(`${label}: `, startX + contentGap, currentY, { continued: true });
          doc.font("Helvetica").fillColor("black").text(value || "N/A");
          currentY += textHeight + fieldGap;
        };

        drawField("Audit Check Points", opt.AuditCheckPoints);
        drawField("Amount", opt.amount);
        drawField("Total Amount", opt.totalAmount);
        drawField("Initial Data Requirement", opt.initialDataRequirement);
        drawField("Person Responsible", opt.personResponsible);
        drawField("Data Received Status", opt.dataReceivedStatus);
        drawField("Additional Details Required", opt.additionalDetailsRequired);
        drawField("Work Status", opt.workStatus);
        drawField("Queries / Observation", opt.queriesObservation);

        // Draw box around the audit point
        const boxHeight = currentY - startY + contentGap;
        doc.roundedRect(startX, startY, 550, boxHeight, 6).stroke("#AAB7B8");

        // Move below the box for next audit point
        doc.y = startY + boxHeight + 10;
      });
    } else {
      doc.text("No audit points available.");
    }

    // =========================
    // FOOTER
    // =========================
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).fillColor("gray")
        .text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 40, { align: "center" });
    }

    doc.end();

  } catch (err) {
    console.error("Region PDF Error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Error generating region PDF" });
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
      return res.status(404).json({ message: "No audits found for this company" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=company_${companyId}_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // =========================
    // HEADER
    // =========================
    doc.rect(0, 0, doc.page.width, 80).fill("#0A3D62");
    doc.fillColor("white").fontSize(22).text("COMPANY AUDIT REPORT", 0, 30, { align: "center" });
    doc.moveDown(2);

    doc.fillColor("black").fontSize(12)
      .text(`Company: ${audits[0].companyId?.name || "N/A"}`)
      .moveDown(1)
      .text(`Generated On: ${new Date().toLocaleDateString()}`)
      .moveDown(2);

    // =========================
    // AUDIT LOOP
    // =========================
    audits.forEach((audit, idx) => {
      // Branch + Region Header Box
      const headerHeight = 30;
      doc.rect(doc.x, doc.y, 520, headerHeight).fill("#D6EAF8").stroke();
      doc.fillColor("#3c129e").fontSize(13).text(
        `Branch: ${audit.branchId?.name || "N/A"} | Region: ${audit.regionId?.name || "N/A"}`,
        doc.x + 10,
        doc.y + 7
      );
      doc.moveDown(2);

      if (audit.options && audit.options.length > 0) {
        audit.options.forEach((opt, i) => {
          const startX = doc.x;
          const startY = doc.y;
          const contentGap = 5; // Gap inside box
          const fieldGap = 4; // Gap between lines
          let currentY = startY + contentGap;

          // Measure content height dynamically
          const drawField = (label, value) => {
            const fieldText = `${label}: ${value || "N/A"}`;
            const maxWidth = 520 - 2 * contentGap;
            const fieldHeight = doc.heightOfString(fieldText, { width: maxWidth });
            doc.font("Helvetica-Bold").fillColor("black").text(`${label}: `, startX + contentGap, currentY, { continued: true });
            doc.font("Helvetica").fillColor("black").text(value || "N/A");
            currentY += fieldHeight + fieldGap;
          };

          // Draw fields to calculate total height
          drawField("Audit Check Ponits", opt.AuditCheckPoints);
          drawField("Amount", opt.amount);
          drawField("Total Amount", opt.totalAmount);
          drawField("Initial Data Requirement", opt.initialDataRequirement);
          drawField("Person Responsible", opt.personResponsible);
          drawField("Data Received Status", opt.dataReceivedStatus);
          drawField("Additional Details Required", opt.additionalDetailsRequired);
          drawField("Work Status", opt.workStatus);
          drawField("Queries / Observation", opt.queriesObservation);

          // Draw box around content dynamically
          const boxHeight = currentY - startY + contentGap;
          doc.roundedRect(startX, startY, 550, boxHeight, 6).stroke("#AAB7B8");

          doc.y = startY + boxHeight + 10; // move below the box
        });
      } else {
        doc.text("No audit points available.");
        doc.moveDown(1);
      }

      // Add page break only if needed
      if (idx !== audits.length - 1) doc.addPage();
    });

    // =========================
    // FOOTER
    // =========================
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).fillColor("gray")
        .text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 40, { align: "center" });
    }

    doc.end();
  } catch (err) {
    console.error("PDF Error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Error generating company PDF" });
  }
};
