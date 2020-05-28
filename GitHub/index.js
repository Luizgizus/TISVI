require("dotenv").config();

const ApiGitHub = require("./src/apiGitHub");
const apiGitHub = new ApiGitHub();

async function start() {
  const usersNames = [
    "jwd-ali",
    "ankitkanojia",
    "polm",
    "denistsoi",
    "cagri90",
  ];
  const languagesJob = [
    'JavaScript',
    "C",
    "C++"
  ]
  await apiGitHub.startFile(languagesJob);
  for (let i = 0; i < usersNames.length; i++) {
    await apiGitHub.getFeatures(usersNames[i], languagesJob);
  }
}

start();
