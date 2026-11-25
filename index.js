import express from "express";
import boottstrap from "./src/app.controller.js";
import chalk from "chalk";

const app = express();
const port = process.env.PORT || 3000;

boottstrap(app, express);

app.use(express.json());

app.listen(port, () => {
  console.log(chalk.blue.bgRed.bold(`Server running on http://localhost:${port}`));
});
