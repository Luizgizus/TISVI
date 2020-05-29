const ApiStackoverflow = require("./src/apiStackoverflow");
const apiStackoverflow = new ApiStackoverflow();

async function start() {
  const usersidsSTack = [
    1709587,
    4119452,
    1119863,
    10982972,
    523612,
    24874,
    3953764,
    7670262,
    922184,
    12488509,
    2630078,
    48523
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
