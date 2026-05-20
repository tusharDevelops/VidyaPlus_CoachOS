import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import app from "./app";

// Inject indicator variable for Edge environment
process.env.CLOUDFLARE_WORKER = "true";

// Start Express listener on port 3000
const port = 3000;
app.listen(port);

export default httpServerHandler({ port });
