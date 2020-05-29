const ApiStackoverflow = require("./src/apiStackoverflow");
const apiStackoverflow = new ApiStackoverflow();

async function start() {
  const usersidsSTack = [
    4995,
    17717,
    5846,
    77723,
    68469,
    14919,
    39338,
    1508,
    124543,
    161145
  ];
  const languagesJob = [
    'JavaScript',
    "C",
    "php",
    "C#",
    "C++"
  ]

  await apiStackoverflow.startFile(languagesJob);

  for (let i = 0; i < usersidsSTack.length; i++) {
    console.log("doind id: " + usersidsSTack[i]);
    await apiStackoverflow.getFeatures(usersidsSTack[i], languagesJob);
  }
}

start();
