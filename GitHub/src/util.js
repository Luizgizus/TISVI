const _ = require("lodash");
const moment = require("moment");

class Util {
  constructor() {}

  getCsvStringHeadder() {
    const headers = {
      "login do usuario avaliado": null,
      "Percentual de issues fechadas": null,
      "Escala do percentual de issues fechadas": null,
      "Quantidade de reações nas issues": null,
      "Escala da quantidade de reações nas issues": null,
      "Percentual de segudores": null,
      "Escala do percentual de segudores": null,
      "Percentual de repositórios na mesma linguagem da vaga": null,
      "Escala do percentual de repositórios na mesma linguagem da vaga": null,
      "Popularidade do repositório": null,
      "Escala da popularidade do repositório": null,
      "Média de watchers": null,
      "Escala da média de watchers": null,
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
