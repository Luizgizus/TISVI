class Model {
  constructor() {}

  getStringIssues(userName, next = false) {
    let stringQuery = null;
    if (next) {
      stringQuery =
        `` +
        `query{ 
            search(query:"${userName}", type:USER, first: 10, after:"${next}") {
                pageInfo{
                  endCursor
                  hasNextPage
                }
                nodes {
                    ...on User {
                        issues(last:100, orderBy:{field:CREATED_AT, direction:DESC}) {
                            pageInfo { 
                                hasNextPage
                                endCursor
                            }
                            totalCount
                            nodes {
                                closed
                                reactions(last:100) {
                                    nodes {
                                        content
                                    }
                                }
                                repository {
                                    primaryLanguage{
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;
    } else {
      stringQuery =
        `` +
        `query{ 
            search(query:"${userName}", type:USER, first: 10) {
                pageInfo{
                  endCursor
                  hasNextPage
                }
                nodes {
                    ...on User {
                        issues(last:100, orderBy:{field:CREATED_AT, direction:DESC}) {
                            pageInfo { 
                                hasNextPage
                                endCursor
                            }
                            totalCount
                            nodes {
                                closed
                                reactions(last:100) {
                                    nodes {
                                        content
                                    }
                                }
                                repository {
                                    primaryLanguage{
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;
    }
    return stringQuery;
  }

  getStringRepositories(userName, next) {
    let stringQuery = null;

    if (next) {
      stringQuery =
        `` +
        `query {
            search(query:"${userName}", type:USER, first: 10, after: ${next}) {
                pageInfo{
                  endCursor
                  hasNextPage
                }
                nodes {
                    ...on User {
                        repositories(last:100) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            totalCount
                                nodes {
                                languages(first: 10) {
                                    nodes {
                                        name
                                    }
                                }
                                stargazers {
                                    totalCount
                                }
                                url
                                watchers {
                                    totalCount
                                }
                            }
                        }
                    }
                }
            }
        }`;
    } else {
      stringQuery =
        `` +
        `query {
            search(query:"${userName}", type:USER, first: 10) {
                pageInfo{
                  endCursor
                  hasNextPage
                }
                nodes {
                    ...on User {
                        repositories(last:100) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            totalCount
                                nodes {
                                languages(first: 10) {
                                    nodes {
                                        name
                                    }
                                }
                                stargazers {
                                    totalCount
                                }
                                url
                                watchers {
                                    totalCount
                                }
                            }
                        }
                    }
                }
            }
        }`;
    }

    return stringQuery;
  }
}

module.exports = Model;
