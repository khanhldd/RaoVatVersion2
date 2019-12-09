const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
//Connect Database
connectDB();

//Init Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ extended: false }));

//Set Path
app.get("/", (req, res) => res.send("API running"));
//Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/bikes", require("./routes/api/bikes"));
app.use("/api/jobs", require("./routes/api/jobs"));
app.use("/api/pets", require("./routes/api/pets"));
app.use("/api/fashions", require("./routes/api/fashions"));
app.use("/api/services", require("./routes/api/services"));



//Start web server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
