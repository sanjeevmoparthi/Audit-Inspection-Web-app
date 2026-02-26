const express = require("express");
const app = express();
const dotenv = require("dotenv");
require("dotenv").config();
const cors = require("cors");
const connectDB = require('./config/db.js');



const bodyParser = require('body-parser');
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 5000 ;

connectDB();

// import the Router Files 
const branchRoutes = require("./routes/branchRoutes.js");
const auditRoutes = require("./routes/auditRoutes.js");
const regionRoutes = require("./routes/regionRoutes");
const companyRoutes = require("./routes/companyRoutes.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/branches", branchRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/companies", companyRoutes);


app.listen(PORT, () => console.log("Server running on port 5000"));
