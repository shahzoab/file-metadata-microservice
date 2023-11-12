const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (_req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Connect to database
let mongoose = require("mongoose");
mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Create File schema
let FileShema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  file: {
    type: Buffer,
    required: true
  }
});

// Create File model
let File = mongoose.model("File", FileShema);

// API endpoint to upload file
app.post("/api/fileanalyse", upload.single("upfile"), function (req, res) {
  try {
    if (!req.file) {
      return res.json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const newFile = new File({
      name: originalname,
      type: mimetype,
      size,
      file: buffer
    });

    newFile
      .save()
      .then(doc => {
        res.json({
          name: doc.name,
          type: doc.type,
          size: doc.size
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (error) {
    console.error(error);
    res.json({ error: "No file uploaded" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
