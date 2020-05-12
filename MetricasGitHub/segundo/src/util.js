const _ = require("lodash");
const moment = require("moment");

class Util {
  constructor() {}

  getCsvStringHeadderRepo() {
    const headers = {
      "Id do usuario": null,
      "Média de popularidade do repositório": null,
      "Média de watchers": null,
    };
    const keys = _.keysIn(headers);
    return keys.join(";") + "\n";
  }

  getCsvStringHeadderIssue() {
    const headers = {
      "Id do usuario": null,
      "Quantidade de reações nas issues": null,
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
