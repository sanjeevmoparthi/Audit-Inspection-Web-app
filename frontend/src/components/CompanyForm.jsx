
import { useEffect, useState } from "react";
import api from "../api";
import "../styles/home.css";

export default function CompanyForm({
  selectedCompany,
  clearSelection,
  onCompanyAdded,
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  // 🔥 Auto-fill when editing
  useEffect(() => {
    if (selectedCompany) {
      setName(selectedCompany.name || "");
      setLocation(selectedCompany.location || "");
    } else {
      // IMPORTANT: reset when switching to Add mode
      setName("");
      setLocation("");
    }
  }, [selectedCompany]);

  const handleSubmit = async () => {
    if (!name.trim() || !location.trim()) {
      alert("All fields are required");
      return;
    }

    try {
      if (selectedCompany) {
        // UPDATE
        await api.put(`/companies/${selectedCompany._id}`, {
          name,
          location,
        });
        alert("Company updated successfully");
      } else {
        // ADD
        await api.post("/companies", { name, location });
        alert("Company added successfully");
      }

      // 🔥 Clear inputs AFTER success
      setName("");
      setLocation("");

      onCompanyAdded();
      clearSelection();

    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setName("");
    setLocation("");
    clearSelection(); // hides form
  };
  return (
  <div className="formWrapper">
    <div className="card p-4 companyFormCard">
      <h4 className="text-center mb-3">
        {selectedCompany ? "Update Company" : "Add New Company"}
      </h4>

      {/* Company Name */}
      <div className="mb-3">
        <label className="form-label">Company Name :</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="mb-3">
        <label className="form-label">Location :</label>
        <input
          type="text"
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="text-center">
        <button className="btn btn-success me-2" onClick={handleSubmit}>
          {selectedCompany ? "Update" : "Save"}
        </button>

        <button className="btn btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);
}