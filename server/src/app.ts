import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

//middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//imports routes 
import authRouter from "./modules/auth/auth.routes.js"
import dashboardRouter from "./modules/dashboard/dashboard.routes.js"
import permissionRouter from "./modules/permission/permission.routes.js"
import permissionGroupRouter from "./modules/permission-group/permission-group.routes.js"
import roleRouter from "./modules/role/role.routes.js"
import userRouter from "./modules/user/user.routes.js"
import categoryRouter from "./modules/category/category.routes.js"
import brandRouter from "./modules/brand/brand.routes.js"
import attributeRouter from "./modules/attribute/attribute.routes.js"
import mediaRouter from "./modules/media/media.routes.js"
import productRouter from "./modules/product/product.routes.js"


//routes declaration
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/permissions", permissionRouter)
app.use("/api/v1/permission-groups", permissionGroupRouter)
app.use("/api/v1/role", roleRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/media", mediaRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/brand", brandRouter)
app.use("/api/v1/attribute", attributeRouter)
app.use("/api/v1/product", productRouter)


export default app;