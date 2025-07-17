const express = require("express");
const cors = require("cors");
require("dotenv").config();

const filmRoutes = require("./routes/film.routes");
const rawRoutes = require("./routes/rawMaterial.routes");
const moveRoutes = require("./routes/movement.routes");
const errorHandler = require("./middlewares/errorHandler");
const alertRoutes = require('./routes/alert.routes');
const jobCardRoutes = require('./routes/jobcard.routes');
const backupRoutes = require('./routes/backup.routes');
const topSellingRoutes = require('./routes/topSelling.routes');


const app = express();
app.use(cors(), express.json());

app.use("/api/inventory/films", filmRoutes);
app.use("/api/inventory/raw-materials", rawRoutes);
app.use("/api/inventory/movements", moveRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/job-cards', jobCardRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/top-selling', topSellingRoutes);


app.get("/", (req, res) => res.send("Hydro Dip Inventory API is running..."));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));



