import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";
import mongoose from "mongoose";
import { randomBytes } from "crypto";

const app = express();
const logger = morgan("dev");

// 무작위로 생성된 32바이트 길이의 쿠키 시크릿
const cookieSecret = randomBytes(32).toString("hex");

console.log("DB_URL:", dbUrl);

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose
    .connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        const sessionMiddleware = session({
            secret: cookieSecret,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                clientPromise: mongoose.connection.getClient(), // 여기를 수정
            }),
        });

        app.use(sessionMiddleware);
        app.use(flash());
        app.use(localsMiddleware);
        app.use("/uploads", express.static("uploads"));
        app.use("/static", express.static("assets"));
        app.use("/", rootRouter);
        app.use("/videos", videoRouter);
        app.use("/users", userRouter);
        app.use("/api", apiRouter);

        app.listen(4000, () => {
            console.log("Server is running on http://localhost:4000");
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

    export default app;
