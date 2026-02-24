const PDFDocument = require("pdfkit");

const generatePDF = (audit) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Title
    doc.fontSize(18).text("Audit Report", { align: "center" });
    doc.moveDown();

    // Company & Branch
    doc.fontSize(12).text(`Company: ${audit.companyId?.name || "N/A"}`);
    doc.text(`Branch: ${audit.branchId?.name || "N/A"}`);
    doc.moveDown();

    // Options Section
    if (audit.options && audit.options.length > 0) {
      audit.options.forEach((option, index) => {
        doc.fontSize(14).text(`Audit Summary Details Report ${index + 1}`, { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).text(`Title: ${option.title || ""}`);
        doc.text(`Amount: ${option.amount || ""}`);
        doc.text(`Total Amount: ${option.totalAmount || ""}`);
        doc.text(`Initial Data Requirement: ${option.initialDataRequirement || ""}`);
        doc.text(`Person Responsible: ${option.personResponsible || ""}`);
        doc.text(`Data Received Status: ${option.dataReceivedStatus || ""}`);
        doc.text(`Additional Details Required: ${option.additionalDetailsRequired || ""}`);
        doc.text(`Work Status: ${option.workStatus || ""}`);
        doc.text(`Queries / Observation: ${option.queriesObservation || ""}`);

        doc.moveDown();
      });
    } else {
      doc.text("No Options Found");
    }

    doc.end();
  });
};

module.exports = generatePDF;
