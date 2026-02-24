const Branch = require("../models/Branch");

// ✅ Get all branches of a company
const getBranchesByCompany = async (req, res) => {
  try {
    const branches = await Branch.find({
      companyId: req.params.companyId
    });

    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single branch
const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add branch
const addBranch = async (req, res) => {
  try {
    const branch = await Branch.create({
      name: req.body.name,
      companyId: req.body.companyId
    });

    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update branch
const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete branch
const deleteBranch = async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBranchesByCompany,
  getBranchById,
  addBranch,
  updateBranch,
  deleteBranch
};