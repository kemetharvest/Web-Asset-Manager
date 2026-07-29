import app from "./app";
import { logger } from "./lib/logger";
import { preloadExcelData } from "./lib/preload";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Pre-load the Excel file if available
preloadExcelData().catch((err) => {
  logger.warn({ err }, "Pre-load failed; continuing without data");
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
