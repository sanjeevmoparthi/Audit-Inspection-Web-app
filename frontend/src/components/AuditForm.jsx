// src/components/AuditForm.jsx
import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/auditform.css";
import { useNavigate } from "react-router-dom";

const emptyOption = {
  optionName: "",
  amount: "",
  totalAmount: "",
  initialDataRequirement: "",
  personResponsible: "",
  dataReceivedStatus: "",
  additionalDetailsRequired: "",
  workStatus: "",
  queriesObservation: ""
};


const AuditForm = ({ regionId, branchId: initialBranchId, companyId: initialCompanyId, refreshAudits }) => {
  const [options, setOptions] = useState([{ ...emptyOption }]);
  const [auditId, setAuditId] = useState(null);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);


  // ✅ Store branchId and companyId in state so they can be used in handleSubmit
  const [branchId, setBranchId] = useState(initialBranchId || "");
  const [companyId, setCompanyId] = useState(initialCompanyId || "");

useEffect(() => {
  const fetchAudit = async () => {
    try {
      const res = await api.get(`/audits/region/${regionId}`);
      setAuditId(res.data._id);
      setOptions(res.data.options);

      // Extract _id if branchId / companyId is an object
      setBranchId(res.data.branchId?._id || res.data.branchId);
      setCompanyId(res.data.companyId?._id || res.data.companyId);
    } catch {
      setAuditId(null);
      setOptions([emptyOption]);
    }
  };
  fetchAudit();
}, [regionId]);

  const addOption = () => setOptions([...options, { ...emptyOption }]);

  const handleChange = (index, e) => {
    const updated = [...options];
    updated[index][e.target.name] = e.target.value;
    setOptions(updated);
  };

  const deleteOption = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!branchId || !companyId) return alert("Branch or Company ID missing!");

//   const payload = { regionId, branchId, companyId, options };

//   try {
//     if (auditId) {
//       await api.put(`/audits/${auditId}`, payload);
//       alert("Audit Updated Successfully");
//     } else {
//       const res = await api.post("/audits", payload);
//       setAuditId(res.data._id);
//       alert("Audit Saved Successfully");
//     }
//     if (refreshAudits) refreshAudits();
//   } catch (err) {
//     console.error(err.response?.data || err);
//     alert("Error saving audit");
//   }
// };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!branchId || !companyId) {
    return alert("Branch or Company ID missing!");
  }

  try {
    const formData = new FormData();

    formData.append("regionId", regionId);
    formData.append("branchId", branchId);
    formData.append("companyId", companyId);
    formData.append("options", JSON.stringify(options));

    // Append files
    for (let i = 0; i < documents.length; i++) {
      formData.append("documents", documents[i]);
    }

    if (auditId) {
      await api.put(`/audits/${auditId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Audit Updated Successfully");
    } else {
      const res = await api.post("/audits", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAuditId(res.data._id);
      alert("Audit Saved Successfully");
    }

    if (refreshAudits) refreshAudits();

  } catch (err) {
    console.error(err.response?.data || err);
    alert("Error saving audit");
  }
};

  return (
    <div className="audit-form-container">
      <h2 className = "audit-title"> Audit Form</h2>
      <button type="button" onClick={addOption} className="btn btn-primary mb-3">
        ➕ Add Audit 
      </button>
      <button
        className="backBtn"
        onClick={() => navigate(-1)}
      >
        <i className="fa-solid fa-backward"></i>  Back
      </button>
      <form onSubmit={handleSubmit}>
        {options.map((opt, idx) => (
          <div key={idx} className="audit-section mb-3 p-2 border">
            <h5>Audit Point {idx + 1}</h5>
            <label className="form-label">Audit Checkpoints :</label>
            <textarea
              name="AuditCheckPoints"
              placeholder="Audit Check Points"
              value={opt.AuditCheckPoints}
              onChange={(e) => handleChange(idx, e)}
              required
              className="form-control mb-1"
            />
            <label className="form-label">Amount :</label>
            <textarea
              name="amount"
              placeholder="Amount"
              value={opt.amount}
              onChange={(e) => handleChange(idx, e)}
              required
              className="form-control mb-1"
            />
            <label className="form-label">Total Amount :</label>
            <textarea
              name="totalAmount"
              placeholder="Total Amount"
              value={opt.totalAmount}
              onChange={(e) => handleChange(idx, e)}
              required
              className="form-control mb-1"
            />
            <label className="form-label">Initial Data Requirement :</label>
            <textarea
              name="initialDataRequirement"
              placeholder="Initial Data Requirement"
              value={opt.initialDataRequirement}
              onChange={(e) => handleChange(idx, e)}
              className="form-control mb-1"
            />
            <label className="form-label">Person Responsible :</label>
            <textarea
              name="personResponsible"
              placeholder="Person Responsible"
              value={opt.personResponsible}
              onChange={(e) => handleChange(idx, e)}
              className="form-control mb-1"
            />
            <label className="form-label">Data Received Status :</label>
            <textarea
              name="dataReceivedStatus"
              placeholder="Data Received Status"
              value={opt.dataReceivedStatus}
              onChange={(e) => handleChange(idx, e)}
              className="form-control mb-1"
            />
            <label className="form-label">Additional Details Required :</label>
            <textarea
              name="additionalDetailsRequired"
              placeholder="Additional Details Required"
              value={opt.additionalDetailsRequired}
              onChange={(e) => handleChange(idx, e)}
              className="form-control mb-1"
            />
            <label className="form-label">Work Status :</label>
            <textarea
              name="workStatus"
              placeholder="Work Status"
              value={opt.workStatus}
              onChange={(e) => handleChange(idx, e)}
              className="form-control mb-1"
            />
            <label className="form-label">Queries & Observation :</label>
            <textarea
              name="queriesObservation"
              placeholder="Queries / Observation"
              value={opt.queriesObservation}
              onChange={(e) => handleChange(idx, e)}
              className="form-control mb-1"
            />
            <div className="mb-3">
              <label className="form-label">Upload Documents:</label>
              <input
                type="file"
                multiple
                className="form-control"
                onChange={(e) => setDocuments(e.target.files)}
              />
            </div>
            <button type="button" className="btn btn-danger" onClick={() => deleteOption(idx)}>
              ❌ Delete Audit 
            </button>
          </div>
        ))}


        <button type="submit" className="btn btn-success mt-2">
          💾 Save Audit Form
        </button>
      </form>
    </div>
  );
};

export default AuditForm;

