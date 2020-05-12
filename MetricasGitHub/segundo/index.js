require("dotenv").config();

const ApiGitHub = require("./src/apiGitHub");
const apiGitHub = new ApiGitHub();

async function start() {
  await apiGitHub.startFile();
  await apiGitHub.getFeatures("a");
}

start();

// require("dotenv").config();

// const ApiGitHub = require("./src/apiGitHub");
// const apiGitHub = new ApiGitHub();

// async function start() {
//   const idsTryed = {};
//   const possible = "abcdefghijklmnopqrstuvwxyz0123456789";
//   await apiGitHub.startFile();

//   for (let i = 0; i < 5; i++) {
//     while (true) {
//       id = possible.charAt(Math.floor(Math.random() * possible.length));
//       if (!idsTryed[id]) {
//         idsTryed[id] = true;
//         break;
//       }
//     }
//     console.log(`${i}° tring id ${id}`);
//     const allRight = await apiGitHub.getFeatures(id);

//     if (!allRight) {
//       i--;
//     }
//   }
// }

// start();
