
// =========================================
// Require modules
// -----------------------------------------
const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback-exclusions');
const cors = require('cors');

// =========================================
// Set up express app
// -----------------------------------------
const app = express();
app.use(express.json()); // allow JSON parsing
app.use(history({
    exclusions: [
        '/api/*',
        '/image/*'
    ]
}));
app.use(cors()); // for file uploading

// =========================================
// Launch Server
// -----------------------------------------

// Set port using PORT environment variable
// (eg. using command: set PORT=1337)
// if not set, default to port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log();
    console.log('Server successfully launched!');
    console.log(`Listening on port ${port}...`);
    console.log();
});

// =========================================
// Establish MySQL db connection
// -----------------------------------------

require('./dbConnection');

// =========================================
// Use public folder
// -----------------------------------------

app.use(express.static(path.join(__dirname, '../client/public')));

// =========================================
// API
// -----------------------------------------

const keycapApi = require('./api/keycapApi.js');
app.get('/api/keycap', keycapApi.GET_all);
app.get('/api/keycap/:KeycapPk', keycapApi.GET);
app.post('/api/keycap/', keycapApi.POST);
// app.put('/api/keycap/', keycapApi.PUT);
// app.delete('/api/keycap/:KeycapPk', keycapApi.DELETE);

const makerApi = require('./api/makerApi.js');
app.get('/api/maker/:MakerPk',makerApi.GET);
app.post('/api/maker',makerApi.POST);
app.put('/api/maker',makerApi.PUT);
app.delete('/api/maker/:MakerPk',makerApi.DELETE);

// -------------------------------------------
// File upload

// See https://blog.bitsrc.io/uploading-files-and-images-with-vue-and-express-2018ca0eecd0

const multer = require('multer');

app.use((err, req, res, next) => {
    if (err.code === "INCORRECT_FILETYPE") {
        return sendStatus(res, ApiCode.NOPE_FILE, 'Invalid file type');
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return sendStatus(res, ApiCode.NOPE_FILE, 'Invalid file size');
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Incorrect file');
        error.code = "INCORRECT_FILETYPE";
        return cb(error, false);
    }
    cb(null, true);
};

const upload = multer({
    dest: path.join(__dirname, '../client/public/upload'),
    fileFilter,
    limits: {
        fileSize: 500000 // 500KB
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ file: req.file });
});