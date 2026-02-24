import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import RegionForm from "../components/RegionForm";
import "../styles/regionpage.css";

export default function RegionPage() {
  const {companyId, branchId } = useParams();
  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await api.get(`/regions/branch/${branchId}`);
      setRegions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this region?")) return;

    try {
      await api.delete(`/regions/${id}`);
      fetchRegions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="homeTable">

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setSelectedRegion(null);
          setShowForm(true);
        }}
      >
        Add Region <i className="fa-solid fa-user-plus"></i>
      </button>

      {showForm && (
        <RegionForm
          branchId={branchId}
          selectedRegion={selectedRegion}
          clearSelection={() => {
            setSelectedRegion(null);
            setShowForm(false);
          }}
          onRegionAdded={() => {
            fetchRegions();
            setShowForm(false);
          }}
        />
      )}

      <table className="maintable table-bordered">
        <thead>
          <tr>
            <th>S.no</th>
            <th>Region Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {regions.map((region, index) => (
            <tr key={region._id}>
              <td>{index + 1}</td>

              <td>
                <button
                  className="companyButtons"
                  onClick={() =>
                                navigate(
                                  `/company/${companyId}/branch/${branchId}/region/${region._id}`
                                )
                              }
                >
                  {region.name}
                </button>
              </td>

              <td>
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => {
                    setSelectedRegion(region);
                    setShowForm(true);
                  }}
                >
                  ✏
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(region._id)}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}