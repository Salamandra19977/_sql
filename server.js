const express = require("express");
const app = express();
const db = require("./db");
const path = require("path");
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));

app.get("/", (req, res) => {
    res.end("Welcome to the movie server");
});

function getMovie(req, res) {
    const videoPath = path.resolve(__dirname, "movies", req.filename);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            res.status(416).send("Requested range not satisfiable");
            return;
        }

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        };

        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
}

app.get(
    "/movies/:id",
    (req, res, next) => {
        const id = req.params.id;
        db.get("SELECT * FROM movies WHERE id = ?", [id], (err, row) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else {
                if (!row) {
                    res.status(404).send("Movie not found");
                } else {
                    req.filename = row.filename;
                    next();
                }
            }
        });
    },
    getMovie
);

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});
