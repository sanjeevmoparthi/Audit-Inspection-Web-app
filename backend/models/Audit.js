const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  AuditCheckPoints: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  totalAmount: {
    type: String,
    required: true
  },
  initialDataRequirement: String,
  personResponsible: String,
  dataReceivedStatus: String,
  additionalDetailsRequired: String,
  workStatus: String,
  queriesObservation: String
});

const auditSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    regionId: {                     // ✅ NEW (VERY IMPORTANT)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
      unique: true                   // ✅ One audit per region
    },
    options: [optionSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Audit", auditSchema);