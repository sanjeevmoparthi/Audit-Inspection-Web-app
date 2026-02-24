import { useEffect, useState } from "react";
import api from "../api";
import "../styles/companypage.css";

export default function BranchForm({
  companyId,
  selectedBranch,
  clearSelection,
  onBranchAdded,
}) {
  const [name, setName] = useState("");

  // 🔥 Auto-fill when editing
  useEffect(() => {
    if (selectedBranch) {
      setName(selectedBranch.name || "");
    } else {
      setName("");
    }
  }, [selectedBranch]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Branch name is required");
      return;
    }

    try {
      if (selectedBranch) {
        // ✅ UPDATE
        await api.put(`/branches/${selectedBranch._id}`, {
          name,
        });
        alert("Branch updated successfully");
      } else {
        // ✅ ADD
        await api.post("/branches", {
          name,
          companyId,
        });
        alert("Branch added successfully");
      }

      // 🔥 Clear after success
      setName("");

      onBranchAdded();
      clearSelection();

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleCancel = () => {
    setName("");
    clearSelection();
  };

  return (
    <div className="formWrapper">
      <div className="card p-4 companyFormCard">
        <h4 className="text-center mb-3">
          {selectedBranch ? "Update Branch" : "Add New Branch"}
        </h4>

        {/* Branch Name */}
        <div className="mb-3">
          <label className="form-label">Branch Name :</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="text-center">
          <button className="btn btn-success me-2" onClick={handleSubmit}>
            {selectedBranch ? "Update" : "Save"}
          </button>

          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}