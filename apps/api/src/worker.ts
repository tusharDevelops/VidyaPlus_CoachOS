import serverless from "serverless-http";
import app from "./app";

// Inject indicator variable for Edge environment
process.env.CLOUDFLARE_WORKER = "true";

export default {
  fetch: serverless(app)
};
