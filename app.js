const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", indexRouter);

const mongoURI = process.env.LOCAL_DB_ADDRESS;

// MongoDB 연결
mongoose
    .connect(mongoURI, { useNewUrlParser: true })
    .then(() => console.log("mongoose connected"))
    .catch((err) => console.log("DB connection fail", err));

// 서버 연결 함수
function startServer() {
    const server = app.listen(process.env.PORT || 5000, () => {
        console.log(`server is on ${process.env.PORT}`);
    });

    // 서버 에러 핸들링 및 재시도
    server.on("error", (err) => {
        console.log("server error", err);
        console.log("Retrying to connect in 2 seconds...");
        setTimeout(startServer, 2000); // 5초 후에 서버 다시 시도
    });
}

// 서버 시작
startServer();
