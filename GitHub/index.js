require("dotenv").config();

const ApiGitHub = require("./src/apiGitHub");
const apiGitHub = new ApiGitHub();

async function start() {
  await apiGitHub.startFile();
  const usersNames = [
    "jwd-ali",
    "ankitkanojia",
    "polm",
    "denistsoi",
    "cagri90",
  ];
  for (let i = 0; i < usersNames.length; i++) {
    await apiGitHub.getFeatures(usersNames[i]);
  }
}

start();
