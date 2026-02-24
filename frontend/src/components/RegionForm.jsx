import { useEffect, useState } from "react";
import api from "../api";
import "../styles/home.css";


export default function RegionForm({
  branchId,
  selectedRegion,
  clearSelection,
  onRegionAdded,
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (selectedRegion) {
      setName(selectedRegion.name || "");
    } else {
      setName("");
    }
  }, [selectedRegion]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Region name required");
      return;
    }

    try {
      if (selectedRegion) {
        await api.put(`/regions/${selectedRegion._id}`, {
          name,
        });
        alert("Region updated successfully");
      } else {
        await api.post("/regions", {
          name,
          branchId,
        });
        alert("Region added successfully");
      }

      setName("");
      onRegionAdded();
      clearSelection();

    } catch (err) {
      console.error(err);
      alert("Operation failed");
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
          {selectedRegion ? "Update Region" : "Add New Region"}
        </h4>

        <div className="mb-3">
          <label className="form-label">Region Name :</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="text-center">
          <button className="btn btn-success me-2" onClick={handleSubmit}>
            {selectedRegion ? "Update" : "Save"}
          </button>

          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}