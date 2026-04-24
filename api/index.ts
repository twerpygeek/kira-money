import express from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const httpServer = createServer(app);

// Use a self-invoking async function to avoid top-level await issue
(async () => {
  await registerRoutes(httpServer, app);
})();

// For serverless functions to work with express, export the app as default
export default app;
