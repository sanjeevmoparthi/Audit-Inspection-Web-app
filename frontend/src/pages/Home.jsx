// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api";
// import CompanyForm from "../components/CompanyForm";
// import "../styles/home.css";
// import {Link} from "react-router-dom";

// export default function Home() {
//   const [companies, setCompanies] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   const fetchCompanies = async () => {
//     try {
//       const res = await api.get("/companies");
//       setCompanies(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="homeTable">
//       <CompanyForm onCompanyAdded={fetchCompanies}></CompanyForm>
//       <table className="maintable table-bordered">
//         <thead> 
//           <tr> 
//             <th scope = "col"> S.no </th>
//             <th scope = "col"> Company Name </th>
//             <th scope = "col"> Location </th>
//             <th scope = "col"> Actions </th>
//             </tr>
//           </thead>
//           <tbody>
//             {companies.map((company, index) => (
//               <tr key={company._id}>
//                 <td>{index + 1}</td>

//                 <td>
//                   <button
//                     className="companyButtons "
//                     onClick={() => navigate(`/company/${company._id}`)}
//                   >
//                     {company.name}
//                   </button>
//                 </td>

//                 <td>{company.location || "N/A"}</td>

//                 <td className="actionButtons">
//                   {/* <button class="btn btn-info"> <i class="fa-solid fa-pen-to-square"></i> </button>
//                   <button type="button" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button> */}
//                   {/* ✏ UPDATE BUTTON */}
//                 <Link
//                   to={`/companies/${company._id}`}
//                   className="btn btn-info btn-sm me-2"
//                 >
//                   <i class="fa-solid fa-pen-to-square"></i>
//                 </Link>

//                 {/* 🗑 DELETE BUTTON */}
//                 <button
//                   className="btn btn-danger btn-sm"
//                   onClick={() => handleDelete(company._id)}
//                 >
//                   <i class="fa-solid fa-trash"></i>
//                 </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>

//       </table>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import CompanyForm from "../components/CompanyForm";
import "../styles/home.css";

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DELETE FUNCTION
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;

    try {
      await api.delete(`/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="homeTable">

      <button
  className="btn btn-primary mb-3"
  onClick={() => {
    setSelectedCompany(null); // clear edit
    setShowForm(true);
  }}
>
  Add Company <i class="fa-solid fa-user-plus"></i>
</button>
      {/* FORM */}
      {/* <CompanyForm
        selectedCompany={selectedCompany}
        clearSelection={() => setSelectedCompany(null)}
        onCompanyAdded={fetchCompanies}
      /> */}

        {showForm && (
  <CompanyForm
    selectedCompany={selectedCompany}
    clearSelection={() => {
      setSelectedCompany(null);
      setShowForm(false);
    }}
    onCompanyAdded={() => {
      fetchCompanies();
      setShowForm(false);
    }}
  />
)}


      <table className="maintable table-bordered">
        <thead>
          <tr>
            <th>S.no</th>
            <th>Company Name</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company, index) => (
            <tr key={company._id}>
              <td>{index + 1}</td>

              <td>
                <button
                  className="companyButtons"
                  onClick={() => navigate(`/company/${company._id}`)}
                >
                  {company.name}
                </button>
              </td>

              <td>{company.location || "N/A"}</td>

              <td className="actionButtons">

                {/* ✏ UPDATE BUTTON */}
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowForm(true);
                  }}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>

                {/* 🗑 DELETE BUTTON */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(company._id)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}