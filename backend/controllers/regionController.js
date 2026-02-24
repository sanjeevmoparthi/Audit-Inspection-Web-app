const Region = require("../models/Region");
const Branch = require("../models/Branch");


// ✅ Get all regions OR by branch
const getRegions = async (req, res) => {
  try {
    if (req.params.branchId) {
      const regions = await Region.find({
        branchId: req.params.branchId,
      });
      return res.json(regions);
    }

    const regions = await Region.find();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get single region
const getRegion = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    res.json(region);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Add region
const addRegion = async (req, res) => {
  try {
    const { name, branchId } = req.body;

    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    // Find branch to get companyId
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const region = await Region.create({
      name,
      branchId,
      companyId: branch.companyId,  // ✅ Auto set
    });

    res.status(201).json(region);

  } catch (error) {
    console.error("Add Region Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update region
const updateRegion = async (req, res) => {
  try {
    const updated = await Region.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Delete region
const deleteRegion = async (req, res) => {
  try {
    await Region.findByIdAndDelete(req.params.id);
    res.json({ message: "Region deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getRegions,
  getRegion,
  addRegion,
  updateRegion,
  deleteRegion,
};