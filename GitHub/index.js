require("dotenv").config();

const ApiGitHub = require("./src/apiGitHub");
const apiGitHub = new ApiGitHub();

async function start() {
  await apiGitHub.startFile();
  await apiGitHub.getFeatures();
}

start();
