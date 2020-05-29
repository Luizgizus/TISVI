const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");

const Request = require("./request");
const Model = require("./model");
const Util = require("./util");

class ApiGitHub {
  constructor() {
    this.request = new Request();
    this.model = new Model();
    this.util = new Util();
    this.lasPage = process.env.MAX_PAGE;

    this.defaultRepoData = {
      userName: null,
      qtdReactionsOnIssues: 0,
      scaledQtdReactionsOnIssues: null,
      repoPopAVG: null,
      scaledRepoPopAVG: null,
    };
  }

  getDefaultKeys(languagesJob) {
    let keys = {
      userName: null,
      qtdReactionsOnIssues: 0,
      scaledQtdReactionsOnIssues: null,
      repoPopAVG: null,
      scaledRepoPopAVG: null,
    }

    for (let i = 0; i < languagesJob.length; i++) {
      keys["closedIssuesPercentageOn" + languagesJob[i]] = null
      keys["scaledClosedIssuesPercentageOn" + languagesJob[i]] = null
      keys["followersPercentageOn" + languagesJob[i]] = null
      keys["scaledFollowersPercentageOn" + languagesJob[i]] = null
      keys["repositoryPercentageOn" + languagesJob[i]] = null
      keys["scaledRepositoryPercentageOn" + languagesJob[i]] = null
    }

    return keys
  }

  async startFile(languagesJob) {
    const hasRepoFile = await fs.existsSync("github.csv");
    if (hasRepoFile) {
      await fs.truncateSync("github.csv");
    }
    await fs.appendFileSync(
      "github.csv",
      this.util.getCsvStringHeadder(languagesJob)
    );
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

  getScaleOfReactionsOnIssues(qtdReaction) {
    if (qtdReaction <= 0.2) {
      return 1;
    } else if (qtdReaction > 0.2 && qtdReaction < 5.15) {
      return 2;
    } else if (qtdReaction >= 5.15 && qtdReaction < 24.89) {
      return 3;
    } else if (qtdReaction >= 24.89 && qtdReaction < 82.15) {
      return 4;
    } else if (qtdReaction >= 82.15) {
      return 5;
    } else {
      return 0;
    }
  }

  getScaleOfPopularityInRepositories(Popularoty) {
    if (Popularoty <= 0.06) {
      return 1;
    } else if (Popularoty > 0.06 && Popularoty < 1.2) {
      return 2;
    } else if (Popularoty >= 1.2 && Popularoty < 2.43) {
      return 3;
    } else if (Popularoty >= 2.43 && Popularoty < 5.68) {
      return 4;
    } else if (Popularoty >= 5.68) {
      return 5;
    } else {
      return 0;
    }
  }

  saveOnCsv(
    issuesData,
    followersData,
    repositoriesData,
    jobsLanguages,
    userName
  ) {
    let qtdIssuesClosed = {};
    let qtdfollowerOfLanguage = {};
    let qtdReposOfLanguage = {};
    let totalPop = 0;
    const urlRepos = [];

    this.defaultRepoData = this.getDefaultKeys(jobsLanguages)

    this.defaultRepoData.userName = userName;

    for (let i = 0; i < issuesData.issues.length; i++) {
      const issue = issuesData.issues[i];
      if (issue.closed) {
        if (
          issue.repository.primaryLanguage &&
          jobsLanguages.indexOf(issue.repository.primaryLanguage.name) !== -1
        ) {
          if (_.isEmpty(qtdIssuesClosed) || !qtdIssuesClosed[issue.repository.primaryLanguage.name]) {
            qtdIssuesClosed[issue.repository.primaryLanguage.name] = 1;
          } else {
            qtdIssuesClosed[issue.repository.primaryLanguage.name]++;
          }
        }
      }

      for (let j = 0; j < issue.reactions.nodes.length; j++) {
        if (issue.reactions.nodes[j].content === "THUMBS_UP") {
          this.defaultRepoData.qtdReactionsOnIssues++;
        }
      }
    }

    this.defaultRepoData.scaledQtdReactionsOnIssues = this.getScaleOfReactionsOnIssues(this.defaultRepoData.qtdReactionsOnIssues)

    for (let i = 0; i < followersData.folowers.length; i++) {
      const follower = followersData.folowers[i];
      for (let j = 0; j < follower.repositories.nodes.length; j++) {
        const repo = follower.repositories.nodes[j];
        if (repo.primaryLanguage && jobsLanguages.indexOf(repo.primaryLanguage.name) !== -1) {
          if (_.isEmpty(qtdfollowerOfLanguage) || !qtdfollowerOfLanguage[repo.primaryLanguage.name]) {
            qtdfollowerOfLanguage[repo.primaryLanguage.name] = 1;
          } else {
            qtdfollowerOfLanguage[repo.primaryLanguage.name]++;
          }
          break;
        }
      }
    }

    for (let i = 0; i < repositoriesData.respositories.length; i++) {
      const repo = repositoriesData.respositories[i];
      urlRepos.push(repo.url + ".git");
      for (let j = 0; j < repo.languages.nodes.length; j++) {
        const language = repo.languages.nodes[j];
        if (language && jobsLanguages.indexOf(language.name) !== -1) {
          if (_.isEmpty(qtdReposOfLanguage) || !qtdReposOfLanguage[language.name]) {
            qtdReposOfLanguage[language.name] = 1;
          } else {
            qtdReposOfLanguage[language.name]++;
          }
          break;
        }
      }

      totalPop += repo.stargazers.totalCount;
    }

    for (let i = 0; i < jobsLanguages.length; i++) {

      if (qtdIssuesClosed[jobsLanguages[i]]) {
        this.defaultRepoData['closedIssuesPercentageOn' + jobsLanguages[i]] = (
          qtdIssuesClosed[jobsLanguages[i]] / issuesData.totalCount
        ).toFixed(2);
      } else {
        this.defaultRepoData['closedIssuesPercentageOn' + jobsLanguages[i]] = 0
      }

      this.defaultRepoData['scaledClosedIssuesPercentageOn' + jobsLanguages[i]] = this.getScaleOfPercentage(
        this.defaultRepoData['closedIssuesPercentageOn' + jobsLanguages[i]]
      );





      if (qtdfollowerOfLanguage[jobsLanguages[i]]) {
        this.defaultRepoData['followersPercentageOn' + jobsLanguages[i]] = (
          qtdfollowerOfLanguage[jobsLanguages[i]] / followersData.totalCount
        ).toFixed(2);
      } else {
        this.defaultRepoData['followersPercentageOn' + jobsLanguages[i]] = 0
      }

      this.defaultRepoData['scaledFollowersPercentageOn' + jobsLanguages[i]] = this.getScaleOfPercentage(
        this.defaultRepoData['followersPercentageOn' + jobsLanguages[i]]
      );





      if (qtdReposOfLanguage[jobsLanguages[i]]) {
        this.defaultRepoData['repositoryPercentageOn' + jobsLanguages[i]] = (
          qtdReposOfLanguage[jobsLanguages[i]] / repositoriesData.totalCount
        ).toFixed(2);
      } else {
        this.defaultRepoData['repositoryPercentageOn' + jobsLanguages[i]] = 0
      }

      this.defaultRepoData['scaledRepositoryPercentageOn' + jobsLanguages[i]] = this.getScaleOfPercentage(
        this.defaultRepoData['repositoryPercentageOn' + jobsLanguages[i]]
      );
    }

    this.defaultRepoData.repoPopAVG = (
      totalPop / repositoriesData.totalCount
    ).toFixed(2);

    this.defaultRepoData.scaledRepoPopAVG = this.getScaleOfPopularityInRepositories(this.defaultRepoData.repoPopAVG)

    console.log(urlRepos)

    fs.appendFileSync(
      "github.csv",
      this.util.getCsvString(this.defaultRepoData)
    );
  }

  async getFeatures(userName, languagesNames) {
    const issuesData = await this.getFeaturesOfIssues(userName);
    const followersData = await this.getFeaturesOfFollowers(userName);
    const repositoiesData = await this.getFeaturesOfRepositories(userName);

    this.saveOnCsv(
      issuesData,
      followersData,
      repositoiesData,
      languagesNames,
      userName
    );
  }

  async getFeaturesOfIssues(userName) {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringIssues(userName);
      let hasNext = false;

      const issuesData = {
        totalCount: 0,
        issues: [],
      };

      let body = {
        query: stringQuery,
        variables: {},
      };

      const response = await this.request.post(url, body);

      if (response.statusCode === 200) {
        const dataRepos = response.body.data.search.nodes.pop();
        if (dataRepos) {
          if (dataRepos.issues.totalCount > 100) {
            issuesData.totalCount = 100;
          } else {
            issuesData.totalCount = dataRepos.issues.totalCount;
          }

          issuesData.issues = dataRepos.issues.nodes;
        }
      } else {
        console.log(response);
        console.log(response.statusCode);
        console.log("SOME ERROR APPEARED");
      }

      return issuesData;
    } catch (err) {
      console.log(err);
    }
  }

  async getFeaturesOfFollowers(userName) {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringFollowers(userName);
      let hasNext = false;

      const folowersData = {
        totalCount: 0,
        folowers: [],
      };

      let body = {
        query: stringQuery,
        variables: {},
      };

      do {
        const response = await this.request.post(url, body);
        if (response.statusCode === 200) {
          const dataRepos = response.body.data.search.nodes.pop();
          if (dataRepos) {
            hasNext = dataRepos.followers.pageInfo.hasNextPage;
            stringQuery = this.model.getStringFollowers(
              userName,
              dataRepos.followers.pageInfo.endCursor
            );

            if (dataRepos.followers.totalCount > 100) {
              folowersData.totalCount = 100;
            } else {
              folowersData.totalCount = dataRepos.followers.totalCount;
            }

            folowersData.folowers = dataRepos.followers.nodes;
          }
        } else {
          console.log(response);
          console.log(response.statusCode);
          console.log("SOME ERROR APPEARED");
        }
      } while (hasNext);

      return folowersData;
    } catch (err) {
      console.log(err);
    }
  }

  async getFeaturesOfRepositories(userName) {
    try {
      const url = "https://api.github.com/graphql";

      let stringQuery = this.model.getStringRepositories(userName);

      const respositoriesData = {
        totalCount: 0,
        respositories: [],
      };

      let body = {
        query: stringQuery,
        variables: {},
      };

      const response = await this.request.post(url, body);

      if (response.statusCode === 200) {
        const dataRepos = response.body.data.search.nodes.pop();
        if (dataRepos) {
          if (dataRepos.repositories.totalCount > 100) {
            respositoriesData.totalCount = 100;
          } else {
            respositoriesData.totalCount = dataRepos.repositories.totalCount;
          }

          respositoriesData.respositories = dataRepos.repositories.nodes;
        }
      } else {
        console.log(response);
        console.log(response.statusCode);
        console.log("SOME ERROR APPEARED");
      }

      return respositoriesData;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = ApiGitHub;
