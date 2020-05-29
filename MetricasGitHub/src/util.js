const _ = require("lodash");
const moment = require("moment");

class Util {
  constructor() { }

  getCsvStringHeadder(languagesJob) {
    const headers = {
      "login do usuario avaliado": null,
      "Quantidade de reações nas issues": null,
      "Popularidade do repositório": null,
      "Média de watchers": null,
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
