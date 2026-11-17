import express from "express";
import cors from "cors";
import { router } from "./modules/chat/chat.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
export const app = express();
app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use(router);
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});
app.use(errorMiddleware);
