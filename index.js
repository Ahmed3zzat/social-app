import express from "express";
import boottstrap from "./src/app.controller.js";
import chalk from "chalk";
import "dotenv/config";


const app = express();
const port = process.env.PORT || 3000;

await boottstrap(app, express);

app.listen(port, () => {
  console.log(chalk.blue.bgRed.bold(`Server running on http://localhost:${port}`));
});
