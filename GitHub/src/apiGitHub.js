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
      closedIssuesPercentage: null,
      scaledClosedIssuesPercentage: null,
      qtdReactionsOnIssues: 0,
      scaledQtdReactionsOnIssues: null,
      followersPercentage: null,
      scaledFollowersPercentage: null,
      repositoryPercentageOnSameLanguage: null,
      scaledRepositoryPercentageOnSameLanguage: null,
      repoPopAVG: null,
      scaledRepoPopAVG: null,
      watchersAVG: null,
      scaledWatchersAVG: null,
    };
  }

  async startFile() {
    const hasRepoFile = await fs.existsSync("github.csv");
    if (hasRepoFile) {
      await fs.truncateSync("github.csv");
    }
    await fs.appendFileSync(
      "github.csv",
      this.util.getCsvStringHeadder(this.defaultRepoData)
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

  saveOnCsv(
    issuesData,
    followersData,
    repositoriesData,
    jobLanguage,
    userName
  ) {
    let qtdIssuesClosed = 0;
    let qtdfollowerOfLanguage = 0;
    let qtdReposOfLanguage = 0;
    let totalWatchers = 0;
    let totalPop = 0;
    const urlRepos = [];

    this.defaultRepoData.userName = userName;

    for (let i = 0; i < issuesData.issues.length; i++) {
      const issue = issuesData.issues[i];
      if (issue.closed) {
        if (
          issue.repository.primaryLanguage &&
          issue.repository.primaryLanguage.name === jobLanguage
        ) {
          qtdIssuesClosed++;
        }
      }

      for (let j = 0; j < issue.reactions.nodes.length; j++) {
        if (issue.reactions.nodes[j].content === "THUMBS_UP") {
          this.defaultRepoData.qtdReactionsOnIssues++;
        }
      }
    }

    for (let i = 0; i < followersData.folowers.length; i++) {
      const follower = followersData.folowers[i];
      for (let j = 0; j < follower.repositories.nodes.length; j++) {
        const repo = follower.repositories.nodes[j];
        if (repo.primaryLanguage && repo.primaryLanguage.name === jobLanguage) {
          qtdfollowerOfLanguage++;
          break;
        }
      }
    }

    for (let i = 0; i < repositoriesData.respositories.length; i++) {
      const repo = repositoriesData.respositories[i];
      urlRepos.push(repo.url + ".git");
      for (let j = 0; j < repo.languages.nodes.length; j++) {
        const language = repo.languages.nodes[j];
        if (language && language.name === jobLanguage) {
          qtdReposOfLanguage++;
          break;
        }
      }

      totalPop += repo.stargazers.totalCount;
      totalWatchers += repo.watchers.totalCount;
    }

    this.defaultRepoData.closedIssuesPercentage = (
      qtdIssuesClosed / issuesData.totalCount
    ).toFixed(2);

    this.defaultRepoData.scaledClosedIssuesPercentage = this.getScaleOfPercentage(
      this.defaultRepoData.closedIssuesPercentage
    );

    this.defaultRepoData.followersPercentage = (
      qtdfollowerOfLanguage / followersData.totalCount
    ).toFixed(2);

    this.defaultRepoData.scaledFollowersPercentage = this.getScaleOfPercentage(
      this.defaultRepoData.followersPercentage
    );

    this.defaultRepoData.repositoryPercentageOnSameLanguage = (
      qtdReposOfLanguage / repositoriesData.totalCount
    ).toFixed(2);

    this.defaultRepoData.scaledRepositoryPercentageOnSameLanguage = this.getScaleOfPercentage(
      this.defaultRepoData.repositoryPercentageOnSameLanguage
    );

    this.defaultRepoData.watchersAVG = (
      totalWatchers / repositoriesData.totalCount
    ).toFixed(2);

    this.defaultRepoData.repoPopAVG = (
      totalPop / repositoriesData.totalCount
    ).toFixed(2);

    console.log(urlRepos);

    fs.appendFileSync(
      "github.csv",
      this.util.getCsvString(this.defaultRepoData)
    );
  }

  async getFeatures(userName) {
    const issuesData = await this.getFeaturesOfIssues(userName);
    const followersData = await this.getFeaturesOfFollowers(userName);
    const repositoiesData = await this.getFeaturesOfRepositories(userName);

    this.saveOnCsv(
      issuesData,
      followersData,
      repositoiesData,
      "JavaScript",
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
