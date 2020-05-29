require("dotenv").config();

const ApiGitHub = require("./src/apiGitHub");
const apiGitHub = new ApiGitHub();

async function start() {
  const usersNames = [
    "wallacemaxters",
    "isaiasdd",
    "pablotdv",
    "LeonardoBonetti",
    "artptrapp",
    "jlHertel",
    "brumazzi",
    "cegesser",
    "darcamo",
    "durvalcarvalho"
  ];
  const languagesJob = [
    'JavaScript',
    "C",
    "php",
    "C#",
    "C++"
  ]
  await apiGitHub.startFile(languagesJob);
  for (let i = 0; i < usersNames.length; i++) {
    console.log("doind user: " + usersNames[i]);
    await apiGitHub.getFeatures(usersNames[i], languagesJob);
  }
}

start();
