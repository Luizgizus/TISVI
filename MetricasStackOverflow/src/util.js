const _ = require("lodash");
const moment = require("moment");

class Util {
  constructor() {}

  getCsvStringHeadder() {
    const headers = {
      "Score médio das perguntas": null,
      "Score médio das respostas": null,
      "Reputação ": null,
    };
    const keys = _.keysIn(headers);
    return keys.join(";") + "\n";
  }

  getCsvString(clonedDefaultRepoData) {
    const values = _.valuesIn(clonedDefaultRepoData);
    return values.join(";") + "\n";
  }
}

module.exports = Util;
