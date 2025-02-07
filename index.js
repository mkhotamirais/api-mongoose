import express from "express";
import cors from "cors";
import "dotenv/config";
import db from "./config/index.js";
import path from "path";
import { fileURLToPath } from "url";
const dirName = path.dirname(fileURLToPath(import.meta.url));
import cookieParser from "cookie-parser";
import { corsOptions, credentials, logError, logSuccess } from "./middleware.js";

import v0Router from "./app/v0/router.js";
import v1Router from "./app/v1/router.js";
// import v2Router from "./v2/router.js";
// import v3Router from "./v3/router.js";
// import v4Router from "./v4/router.js";
// import v5Router from "./v5/router.js";

const app = express();
const port = process.env.PORT || 3000;

// app.use(logSuccess);

app.use(credentials); // --- built-in middleware
app.use(cors(corsOptions)); // mw for 'content-type: application/x-www-form-urlencoded' / form data
// app.use(cors());
app.use(express.json()); // mw for json
app.use(express.static(path.join(dirName, "public"))); // mw for serve static file (ex: public)
app.use(express.urlencoded({ extended: true })); // mw for cookies
app.use(cookieParser()); // mw for cookiescookieParser());

app.get("/", (req, res) => {
  res.send("Api Mongoose");
});

// app.get("^/$|/index(.html)?", (req, res) => {
//   // res.sendFile("./views/index.html", { root: dirName });
//   res.sendFile(path.join(dirName, "views", "index.html"));
// });
// app.get("/newpage(.html)?", (req, res) => {
//   res.sendFile(path.join(dirName, "views", "new-page.html"));
// });
// app.get("/oldpage(.html)?", (req, res) => {
//   res.redirect(301, "/newpage");
// });
// app.get("/subdir-page", (req, res) => {
//   res.sendFile(path.join(dirName, "views", "subdir", "index.html"));
// });

// ------ route ------

app.use("/api-mongoose/v0", v0Router);
app.use("/api-mongoose/v1", v1Router);
// app.use("/api-mongoose/v2", v2Router);
// app.use("/api-mongoose/v3", v3Router);
// app.use("/api-mongoose/v4", v4Router);
// app.use("/api-mongoose/v5", v5Router);

// ------ route ------

// --- custom middleware
// const mw1 = (req, res, next) => {
//   req.nama = "ahmad";
//   next();
// };
// const mw2 = (req, res, next) => {
//   req.nama = "abdul";
//   req.umur = 20;
//   console.log(req.umur);
//   next();
// };
// app.use(mw1);
// app.use("/mw-a", mw2, (req, res) => {
//   res.json({
//     nama: req.nama,
//     message: "middleware mw1 dijalankan di semua endpoin di bawahnya, sedangkan mw2 hanya dijalankan di endpoin /mw-a",
//   });
// });
// app.use("/mw-b", (req, res) => {
//   res.json({ nama: req.nama });
// });

app.all("/*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) res.sendFile(path.join(dirName, "views", "404.html"));
  else if (req.accepts("json")) res.json({ message: "404 Not Found" });
  else res.type("txt").send("404 Not Found");
});

// app.use(logError);

db.then(() => {
  app.listen(port, () => console.log(`connect to mongodb and running on http://localhost:${port}`));
}).catch((err) => console.log(err));

// mongoose.connection.once("open", () => {
//   app.listen(port, () => log(`Server connected to mongodb and running on port ${port}`));
// });

// mongoose.connection.on("error", (error) => {
//   // logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, "mongoErrLog.log");
//   console.log(error);
// });

// Status Code
// 200: ok
// 201: created
// 204: no content
// 400: bad request
// 401: unauthorized
// 403: forbidden
// 409: conflict
// 500: internal server error
