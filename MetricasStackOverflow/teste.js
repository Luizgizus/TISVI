let id = null;
const idsTryed = {};
while (true) {
  id = parseInt(Math.random() * 100);
  console.log(id);
  if (!idsTryed[id]) {
    idsTryed[id] = true;
    break;
  }
}
