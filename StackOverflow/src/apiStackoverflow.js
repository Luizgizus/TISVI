const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");

const Request = require("./request");
const Util = require("./util");

class ApiStackoverflow {
  constructor() {
    this.request = new Request();
    this.util = new Util();
    this.lasPage = process.env.MAX_PAGE;
    this.dataToFile = {
      idUser: null,
      percentageQuestionOfLangauge: null,
      scaledercentageQuestionOfLangauge: null,
      scoreQuestionAVG: null,
      scaledScoreQuestionAVG: null,
      percentageAnswerOfLangauge: null,
      scaledepercentageAnswerOfLangauge: null,
      scoreAnswerAVG: null,
      scaledScoreAnswerAVG: null,
      reputation: null,
      scaledReputation: null,
    };
  }

  getScaleOfPercentage(percentage) {
    if (percentage === 0) {
      return 0;
    } else if (percentage < 0.2) {
      return 1;
    } else if (percentage >= 0.2 && percentage < 0.4) {
      return 2;
    } else if (percentage >= 0.4 && percentage < 0.6) {
      return 3;
    } else if (percentage >= 0.6 && percentage < 0.8) {
      return 4;
    } else if (percentage >= 0.8) {
      return 5;
    } else {
      return 0;
    }
  }

  getScaleOfScoreQuestion(percentage) {
    if (percentage === 0) {
      return 0;
    } else if (percentage < 0.5) {
      return 1;
    } else if (percentage >= 0.5 && percentage < 1.86) {
      return 2;
    } else if (percentage >= 1.86 && percentage < 3.42) {
      return 3;
    } else if (percentage >= 3.42 && percentage < 5.8) {
      return 4;
    } else if (percentage >= 5.8) {
      return 5;
    } else {
      return 0;
    }
  }

  getScaleOfScoreAnswers(percentage) {
    if (percentage === 0) {
      return 0;
    } else if (percentage < 0.73) {
      return 1;
    } else if (percentage >= 0.73 && percentage < 1.55) {
      return 2;
    } else if (percentage >= 1.55 && percentage < 2.66) {
      return 3;
    } else if (percentage >= 2.66 && percentage < 5.67) {
      return 4;
    } else if (percentage >= 5.67) {
      return 5;
    } else {
      return 0;
    }
  }

  getScaleOfReputation(percentage) {
    if (percentage === 0) {
      return 0;
    } else if (percentage < 293) {
      return 1;
    } else if (percentage >= 293 && percentage < 1135) {
      return 2;
    } else if (percentage >= 1135 && percentage < 3340) {
      return 3;
    } else if (percentage >= 3340 && percentage < 10612) {
      return 4;
    } else if (percentage >= 10612) {
      return 5;
    } else {
      return 0;
    }
  }

  async startFile() {
    const hasRepoFile = await fs.existsSync("stackoverflow.csv");
    if (hasRepoFile) {
      await fs.truncateSync("stackoverflow.csv");
    }
    await fs.appendFileSync(
      "stackoverflow.csv",
      this.util.getCsvStringHeadder(this.defaultRepoData)
    );
  }

  buildStackoverflowData(usersData, answersData, questionsData, jobLanguage) {
    const dataToFile = _.clone(this.dataToFile);

    if (
      questionsData.qtdQuestionsByTag &&
      questionsData.qtdQuestionsByTag[jobLanguage]
    ) {
      dataToFile.percentageQuestionOfLangauge = (
        questionsData.qtdQuestionsByTag[jobLanguage] /
        questionsData.qtdQuestions
      ).toFixed(2);
    } else {
      dataToFile.percentageQuestionOfLangauge = 0;
    }

    dataToFile.scaledercentageQuestionOfLangauge = this.getScaleOfPercentage(
      dataToFile.percentageQuestionOfLangauge
    );

    dataToFile.scoreQuestionAVG = questionsData.scoreAvg
      .toFixed(2)
      .toString()
      .replace(".", ",");

    dataToFile.scaledScoreQuestionAVG = this.getScaleOfScoreQuestion(
      questionsData.scoreAvg
    );

    if (
      answersData.qtdAnswersByTag &&
      answersData.qtdAnswersByTag[jobLanguage]
    ) {
      dataToFile.percentageAnswerOfLangauge = (
        answersData.qtdAnswersByTag[jobLanguage] / answersData.qtdAnswers
      ).toFixed(2);
    } else {
      dataToFile.percentageAnswerOfLangauge = 0;
    }

    dataToFile.scaledepercentageAnswerOfLangauge = this.getScaleOfPercentage(
      dataToFile.percentageAnswerOfLangauge
    );

    dataToFile.scoreAnswerAVG = answersData.scoreAvg
      .toFixed(2)
      .toString()
      .replace(".", ",");

    dataToFile.scaledScoreAnswerAVG = this.getScaleOfScoreAnswers(
      answersData.scoreAvg
    );

    dataToFile.idUser = usersData.idUser;

    dataToFile.reputation = usersData.reputaion;

    dataToFile.scaledReputation = this.getScaleOfReputation(
      dataToFile.reputation
    );

    fs.appendFileSync("stackoverflow.csv", this.util.getCsvString(dataToFile));
  }

  async getUsermetrics(idsUser) {
    const defaultUserData = {
      idUser: idsUser,
      reputaion: null,
      scaledReputation: null,
    };

    const url = `https://api.stackexchange.com/2.2/users/${idsUser}?&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=100&site=stackoverflow`;
    const response = await this.request.get(url);

    const data = response.body.items.pop();

    defaultUserData.reputaion = data.reputation;

    // do scaling reputation

    return defaultUserData;
  }

  async getAnswersMetrics(idsUser) {
    const defaultAnswerData = {
      idUser: idsUser,
      scoreAvg: 0,
      scaledScoreAvg: null,
      qtdAnswers: 0,
      scaledQtdAnswers: null,
      qtdAnswersByTag: {},
      scaledQtdAnswersByTag: null,
    };
    let hasNext = null;
    let page = 0;

    do {
      page++;
      const url = `https://api.stackexchange.com/2.2/users/${idsUser}/answers?page=${page}&key=U4DMV*8nvpm3EOpvf69Rxw((&pagesize=100&site=stackoverflow`;
      const response = await this.request.get(url);

      const data = response.body;
      hasNext = data.has_more;
      defaultAnswerData.qtdAnswers += data.items.length;

      for (let i = 0; i < data.items.length; i++) {
        if (defaultAnswerData.scoreAvg === null) {
          defaultAnswerData.scoreAvg = data.items[i].score;
        } else {
          defaultAnswerData.scoreAvg =
            (data.items[i].score + defaultAnswerData.scoreAvg) / 2;
        }

        const urlQuestion = `https://api.stackexchange.com/2.2/questions/${data.items[i].question_id}?key=U4DMV*8nvpm3EOpvf69Rxw((&site=stackoverflow`;
        const responseQuestion = await this.request.get(urlQuestion);

        const question = responseQuestion.body.items.pop();

        for (let j = 0; j < question.tags.length; j++) {
          if (
            _.isEmpty(defaultAnswerData.qtdAnswersByTag) ||
            !defaultAnswerData.qtdAnswersByTag[question.tags[j]]
          ) {
            defaultAnswerData.qtdAnswersByTag[question.tags[j]] = 1;
          } else {
            defaultAnswerData.qtdAnswersByTag[question.tags[j]]++;
          }
        }
      }
    } while (hasNext);

    return defaultAnswerData;
  }

  async getQuestionsMetrics(idsUser) {
    const defaultQuestionsData = {
      idUser: idsUser,
      scoreAvg: 0,
      scaledScoreAvg: null,
      qtdQuestions: 0,
      scaledQtdQuestions: null,
      qtdQuestionsByTag: {},
      scaledQtdQuestionsByTag: null,
    };
    let hasNext = null;
    let page = 0;

    do {
      page++;
      const url = `https://api.stackexchange.com/2.2/users/${idsUser}/questions?page=${page}&pagesize=100&key=U4DMV*8nvpm3EOpvf69Rxw((&site=stackoverflow`;
      const response = await this.request.get(url);

      const data = response.body;
      hasNext = data.has_more;
      defaultQuestionsData.qtdQuestions += data.items.length;

      for (let i = 0; i < data.items.length; i++) {
        if (defaultQuestionsData.scoreAvg === null) {
          defaultQuestionsData.scoreAvg = data.items[i].score;
        } else {
          defaultQuestionsData.scoreAvg =
            (data.items[i].score + defaultQuestionsData.scoreAvg) / 2;
        }

        for (let j = 0; j < data.items[i].tags.length; j++) {
          if (
            _.isEmpty(defaultQuestionsData.qtdQuestionsByTag) ||
            !defaultQuestionsData.qtdQuestionsByTag[data.items[i].tags[j]]
          ) {
            defaultQuestionsData.qtdQuestionsByTag[data.items[i].tags[j]] = 1;
          } else {
            defaultQuestionsData.qtdQuestionsByTag[data.items[i].tags[j]]++;
          }
        }
      }
    } while (hasNext);

    return defaultQuestionsData;
  }

  async getFeatures(userId) {
    try {
      console.log("Getting usersData of:" + userId);
      const usersData = await this.getUsermetrics(userId);
      console.log("Getting answersData of:" + userId);
      const answersData = await this.getAnswersMetrics(userId);
      console.log("Getting questionsData of:" + userId);
      const questionsData = await this.getQuestionsMetrics(userId);

      this.buildStackoverflowData(
        usersData,
        answersData,
        questionsData,
        "javascript"
      );
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = ApiStackoverflow;
