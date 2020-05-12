const ApiStackoverflow = require("./src/apiStackoverflow");
const apiStackoverflow = new ApiStackoverflow();

async function start() {
  await apiStackoverflow.startFile();
  const usersidsSTack = [1780632, 5783700, 355715, 2312051, 2576254];

  for (let i = 0; i < usersidsSTack.length; i++) {
    console.log("doind id: " + usersidsSTack[i]);
    await apiStackoverflow.getFeatures(usersidsSTack[i]);
  }
}

start();
