const Company = require("../models/Company.js");

const getCompanies = async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
};

const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);

  } catch (error) {
    res.status(500).json({ message: "Error fetching company" });
  }
};

const addCompany = async (req, res) => {
  const company = await Company.create(req.body);
  res.json({message:"Company Created Successfully"});
};

// ✅ UPDATE Company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      req.body,
      { new: true }   // returns updated document
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({
      message: "Company Updated Successfully",
      company: updatedCompany,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to update company" });
  }
};

// ✅ DELETE Company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete company" });
  }
};

module.exports = {getCompanies,getCompanyById,addCompany,updateCompany,deleteCompany};