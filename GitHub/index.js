require("dotenv").config();

const ApiGitHub = require("./src/apiGitHub");
const apiGitHub = new ApiGitHub();

async function start() {
  const usersNames = [
    "ExplodingCabbage",
    "mayconmesquita",
    "marcosc90",
    "aakashgarg19",
    "zahlman",
    "drewnoakes",
    "piotr-skotnicki",
    "iamAzeem",
    "Mysticial",
    "bhristov96",
    "serpent5",
    "andrewhavens",

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
