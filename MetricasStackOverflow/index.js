const ApiStackoverflow = require("./src/apiStackoverflow");
const apiStackoverflow = new ApiStackoverflow();

async function start() {
  const idsTryed = {};
  await apiStackoverflow.startFile();

  for (let i = 0; i < 1000; i++) {
    while (true) {
      id = parseInt(Math.random() * 19000);
      if (!idsTryed[id]) {
        idsTryed[id] = true;
        break;
      }
    }
    console.log(`${i}° tring id ${id}`);
    const allRight = await apiStackoverflow.getFeatures(id);

    if (!allRight) {
      i--;
    }
  }
}

start();
