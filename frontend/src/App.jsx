import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CompanyPage from "./pages/CompanyPage";
import RegionPage from "./pages/RegionPage";
import AuditForm from "./components/AuditForm";
import "./App.css";
import AuditPage from "./pages/AuditPage";

function App() {
  return (
    <div className = "App">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company/:companyId" element={<CompanyPage />} />
        <Route path="/company/:companyId/branch/:branchId" element={<RegionPage />} />
        <Route path="/company/:companyId/branch/:branchId/region/:regionId" element={<AuditPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
