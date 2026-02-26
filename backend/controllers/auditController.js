const Audit = require("../models/Audit");
const Region = require("../models/Region");
const PDFDocument = require("pdfkit");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const s3 = require("../config/s3");

/* ================================
   CREATE AUDIT (One per Region)
================================ */
exports.createAudit = async (req, res) => {
  try {
    const { companyId, branchId, regionId, options } = req.body;

    const existing = await Audit.findOne({ regionId });
    if (existing) {
      return res.status(400).json({ message: "Audit already exists for this region" });
    }

    let documents = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {

        const fileName = `${uuidv4()}-${file.originalname}`;

        const key = `companies/${companyId}/branches/${branchId}/regions/${regionId}/${fileName}`;

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        };

        await s3.send(new PutObjectCommand(params));

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        documents.push({
          fileName: file.originalname,
          fileUrl,
          fileType: file.mimetype
        });
      }
    }

    const audit = new Audit({
      companyId,
      branchId,
      regionId,
      options: JSON.parse(options),
      documents
    });

    await audit.save();

    res.status(201).json(audit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating audit" });
  }
};
// exports.createAudit = async (req, res) => {
//   try {
//     const { companyId, branchId, regionId, options } = req.body;

//     // Check if audit already exists for region
//     const existing = await Audit.findOne({ regionId });
//     if (existing) {
//       return res.status(400).json({ message: "Audit already exists for this region" });
//     }

//     const audit = new Audit({
//       companyId,
//       branchId,
//       regionId,
//       options
//     });

//     await audit.save();

//     res.status(201).json(audit);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating audit" });
//   }
// };




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
    const { regionId, branchId, companyId } = req.body;

    // Safely parse options
    const options =
      typeof req.body.options === "string"
        ? JSON.parse(req.body.options)
        : req.body.options;

    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    let newDocuments = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = `${uuidv4()}-${file.originalname}`;
        const key = `companies/${companyId}/branches/${branchId}/regions/${regionId}/${fileName}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
             ACL: "public-read",
          })
        );

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        newDocuments.push({
          fileName: file.originalname,
          fileUrl,
          fileType: file.mimetype,
        });
      }
    }

    // Append new documents (do not delete old ones)
    audit.regionId = regionId;
    audit.branchId = branchId;
    audit.companyId = companyId;
    audit.options = options;
    audit.documents = [...audit.documents, ...newDocuments];

    await audit.save();

    res.json(audit);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
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

    const leftMargin = 50;
    doc.fillColor("black").fontSize(12)
      .text(`Company: ${audit.companyId?.name || "N/A"}`,leftMargin)
      .moveDown(1)
      .text(`Branch: ${audit.branchId?.name || "N/A"}`,leftMargin)
      .moveDown(1)
      .text(`Region: ${audit.regionId?.name || "N/A"}`,leftMargin)
      .moveDown(1)
      .text(`Generated On: ${new Date().toLocaleDateString()}`,leftMargin)
      .moveDown(2);

    // =========================
    // AUDIT OPTIONS LOOP
    // =========================
    // =========================
    // AUDIT OPTIONS LOOP
    // =========================
    if (audit.options && audit.options.length > 0) {

      audit.options.forEach((opt, idx) => {

        const boxStartY = doc.y;
        const leftMargin = 50;
        const boxWidth = 500;
        const fieldSpacing = 6;

        const drawField = (label, value) => {
          doc
            .font("Helvetica-Bold")
            .text(`${label}: `, leftMargin, doc.y, { continued: true, width: boxWidth });

          doc
            .font("Helvetica")
            .text(value || "N/A", { width: boxWidth });

          doc.moveDown(0.5);
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

        const boxEndY = doc.y;

        // Draw box AFTER writing content
        doc
          .roundedRect(leftMargin - 10, boxStartY - 5, boxWidth + 20, boxEndY - boxStartY + 10, 6)
          .stroke("#AAB7B8");

        doc.moveDown(1);
      });

      // =========================
    // DOCUMENT SECTION
    // =========================

    if (audit.documents && audit.documents.length > 0) {
      doc.moveDown(2);
      doc.fontSize(16).fillColor("black").text("Uploaded Documents");
      doc.moveDown(1);

      audit.documents.forEach((file, index) => {
        doc
          .fillColor("blue")
          .text(`${index + 1}. ${file.fileName}`, {
            link: file.fileUrl,
            underline: true
          });
        doc.moveDown(0.5);
      });
    }

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

    const leftMargin = 50;

    doc.fillColor("black").fontSize(12)
      .text(`Company: ${audits[0].companyId?.name || "N/A"}`,leftMargin)
      .moveDown(1)
      .text(`Generated On: ${new Date().toLocaleDateString()}`,leftMargin)
      .moveDown(2);

    // =========================
    // AUDIT LOOP
    // =========================
    audits.forEach((audit, idx) => {
      // Branch + Region Header Box
  const headerHeight = 30;
  const headerWidth = 500; // adjust if needed

  const startY = doc.y;

  doc
    .rect(leftMargin, startY, headerWidth, headerHeight)
    .fill("#D6EAF8");

  doc
    .fillColor("#3c129e")
    .fontSize(13)
    .text(
      `Branch: ${audit.branchId?.name || "N/A"} | Region: ${audit.regionId?.name || "N/A"}`,
      leftMargin + 10,
      startY + 8
    );

  doc.moveDown(2);

      if (audit.options && audit.options.length > 0) {

        audit.options.forEach((opt, i) => {

          const leftMargin = 60;
          const boxWidth = 480;

          const boxStartY = doc.y;

          const drawField = (label, value) => {
            doc
              .font("Helvetica-Bold")
              .fillColor("black")
              .text(`${label}: `, leftMargin, doc.y, {
                continued: true,
                width: boxWidth
              });

            doc
              .font("Helvetica")
              .text(value || "N/A", {
                width: boxWidth
              });

            doc.moveDown(0.5);
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

          const boxEndY = doc.y;

          doc
            .roundedRect(
              leftMargin - 10,
              boxStartY - 5,
              boxWidth + 20,
              boxEndY - boxStartY + 10,
              6
            )
            .stroke("#AAB7B8");

          doc.moveDown(1);
        });

        // =========================
        // DOCUMENT SECTION
        // =========================

        if (audit.documents && audit.documents.length > 0) {
          doc.moveDown(2);
          doc.fontSize(16).fillColor("black").text("Uploaded Documents");
          doc.moveDown(1);

          audit.documents.forEach((file, index) => {
            doc
              .fillColor("blue")
              .text(`${index + 1}. ${file.fileName}`, {
                link: file.fileUrl,
                underline: true
              });
            doc.moveDown(0.5);
          });
        }

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
