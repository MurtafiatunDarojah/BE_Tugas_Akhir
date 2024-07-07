import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import AuthRoute from "./routes/AuthRoute.js";
import EmployeeRoute from "./routes/EmployeeRoute.js";
import HiasRoute from "./routes/HiasRoute.js";
import cookieParser from "cookie-parser";
// import db from "./config/Database.js";

dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "http://office.farmshias.my.id",
    ],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use(AuthRoute);
app.use(EmployeeRoute);
app.use(HiasRoute);

app.listen(5000, () => {
  console.log(`Server Running ....`);
});

// (async () => {
//   await db.sync();
// })();
