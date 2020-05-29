require("dotenv").config();

const ApiGitHub = require("./src/apiGitHub");
const apiGitHub = new ApiGitHub();

async function start() {
  console.log("getting user names")
  const usersNames = await apiGitHub.getUserNamesAleatory();
  await apiGitHub.startFile();
  for (let i = 0; i < usersNames.length; i++) {
    console.log(`getting ${i}-${usersNames[i]} user features`)
    await apiGitHub.getFeatures(usersNames[i]);
  }
}

start();
