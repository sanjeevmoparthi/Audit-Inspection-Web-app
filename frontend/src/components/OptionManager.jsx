import { useState, useEffect } from "react";
import api from "../api";

export default function OptionManager({ auditId }) {
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    fetchAudit();
  }, []);

  const fetchAudit = async () => {
    try {
      const res = await api.get(`/audits/${auditId}`); // GET single audit by ID
      setAudit(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleDownload = () => {
    window.open(`/api/audits/report/${auditId}`, "_blank");
  };

  const handleDelete = async (optionIndex) => {
    if (!window.confirm("Delete this option?")) return;

    const newOptions = [...audit.options];
    newOptions.splice(optionIndex, 1);

    try {
      await api.put(`/audits/${auditId}`, { options: newOptions });
      setAudit({ ...audit, options: newOptions });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      <h3>{audit?.branchId?.name} - Audit Options</h3>
      {audit?.options?.map((opt, index) => (
        <div key={index} className="card p-2 mb-2">
          <div><strong>Option:</strong> {opt.optionName}</div>
          <div><strong>Amount:</strong> {opt.amount}</div>
          <div><strong>Total Amount:</strong> {opt.totalAmount}</div>
          <div><strong>Initial Data:</strong> {opt.initialDataRequirement}</div>
          <div><strong>Person Responsible:</strong> {opt.personResponsible}</div>
          <div><strong>Status:</strong> {opt.dataReceivedStatus}</div>

          <button className="btn btn-danger btn-sm mt-1" onClick={() => handleDelete(index)}>
            Delete Option
          </button>
        </div>
      ))}

      <button className="btn btn-success mt-3 me-2" onClick={handleDownload}>
        Download PDF
      </button>
    </div>
  );
}
