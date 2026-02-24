// src/pages/AuditPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AuditForm from "../components/AuditForm";
import api from "../api";
import "../styles/auditpage.css"; 

export default function AuditPage() {
  const { companyId, branchId, regionId } = useParams();
  const [audits, setAudits] = useState([]);

  const fetchAudits = async () => {
    try {
      const res = await api.get(`/audits/region/${regionId}`);
      setAudits(res.data ? [res.data] : []);
    } catch {
      setAudits([]);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [regionId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Audit?")) return;
    await api.delete(`/audits/${id}`);
    fetchAudits();
  };

const downloadRegionReport = async () => {
  if (!regionId) return alert("Region not selected");

  try {
    const res = await api.get(`/audits/download/region/${regionId}`, {
      responseType: "blob", // Important!
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `region_report_${regionId}.pdf`; // filename
    link.click();

    window.URL.revokeObjectURL(url); // Clean up
  } catch (err) {
    console.error(err);
    alert("Failed to download report");
  }
};

const downloadCompanyReport = async () => {
  if (!companyId) return alert("Company ID not received");
  try {
    const res = await api.get(`/audits/download/company/${companyId}`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `company_report_${companyId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to download company report");
  }
};



  return (
    <div className="container mt-3">
      <h2>Audit Page</h2>

      <AuditForm
        regionId={regionId}
        branchId={branchId}
        companyId={companyId}
        refreshAudits={fetchAudits}
      />

      <div className="mb-3">
        <button className="btn btn-success me-2" onClick={downloadRegionReport}>
          📄 Download Region Report
        </button>
        <button className="btn btn-primary" onClick={downloadCompanyReport}>
          📄 Download Company Report
        </button>
      </div>

      {audits.length > 0 && (
        <>
          <h4 className="mt-4">Saved Audit Data</h4>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Total Audit Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit, idx) => (
                <tr key={audit._id}>
                  <td>{idx + 1}</td>
                  <td>{audit.options.length}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(audit._id)}>
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}