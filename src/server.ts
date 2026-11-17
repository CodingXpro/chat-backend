import "dotenv/config";
import { app } from "./app.js";
import { prisma } from "./config/database.js";
import "./config/firebase.js";
const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () =>
  console.log(`Chat backend running on http://localhost:${port}`),
);
const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
