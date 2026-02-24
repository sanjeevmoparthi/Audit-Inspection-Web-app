import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import BranchForm from "../components/BranchForm";
import "../styles/companypage.css";

export default function CompanyPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get(`/branches/company/${companyId}`);
      setBranches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this branch?")) return;

    try {
      await api.delete(`/branches/${id}`);
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="homeTable">

      {/* ADD BRANCH BUTTON */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setSelectedBranch(null);
          setShowForm(true);
        }}
      >
        Add Branch <i class="fa-solid fa-user-plus"></i>
      </button>

      {/* BRANCH FORM */}
      {showForm && (
        <BranchForm
          companyId={companyId}
          selectedBranch={selectedBranch}
          clearSelection={() => {
            setSelectedBranch(null);
            setShowForm(false);
          }}
          onBranchAdded={() => {
            fetchBranches();
            setShowForm(false);
          }}
        />
      )}

      {/* BRANCH TABLE */}
      <table className="maintable table-bordered">
        <thead>
          <tr>
            <th>S.no</th>
            <th>Branch Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {branches.map((branch, index) => (
            <tr key={branch._id}>
              <td>{index + 1}</td>

              <td>
                <button
                  className="companyButtons"
                  onClick={() =>
                                navigate(`/company/${companyId}/branch/${branch._id}`)
                              }
                >
                  {branch.name}
                </button>
              </td>

              <td>
                {/* UPDATE */}
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => {
                    setSelectedBranch(branch);
                    setShowForm(true);
                  }}
                >
                  ✏
                </button>

                {/* DELETE */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(branch._id)}
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