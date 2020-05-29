class Model {
    constructor() {
        this.idsTryed = {}
    }

    getStringBasicData(userName, next = false) {
        let stringQuery =
            `` +
            `query {
            search(query: "${userName}", type: USER, first: 1) {
                nodes {
                    ... on User {
                        createdAt
                        email
                        id
                        location
                        login
                        name
                        projectsUrl
                    }
                }
            }
        }`;

        return stringQuery;
    }

    getStringFollowers(userName, next = false) {
        let stringQuery =
            `` +
            `query {
            search(query: "${userName}", type: USER, first: 1) {
                nodes {
                    ... on User {
                        followers(last: 100) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            totalCount
                            nodes {
                                repositories(last: 10) {
                                    nodes {
                                        primaryLanguage {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;

        return stringQuery;
    }

    getStringAleatoryUsers() {
        let startQtd = null
        while (true) {
            startQtd = parseInt(Math.random() * 5000);
            if (!this.idsTryed[startQtd]) {
                this.idsTryed[startQtd] = true;
                break;
            }
        }
        let stringQuery =
            `` +
            `query {
                search(type:REPOSITORY, query:"stars:${startQtd}", last:100) {
                    nodes {
                        ... on  Repository{
                            owner {
                            login
                            }
                        }
                    }
                }
            }`;

        return stringQuery;
    }

    getStringIssues(userName) {
        let stringQuery =
            `` +
            `query{ 
            search(query:"${userName}", type:USER, first: 1) {
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

        return stringQuery;
    }

    getStringRepositories(userName) {
        let stringQuery =
            `` +
            `query {
            search(query:"${userName}", type:USER, first: 1) {
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

        return stringQuery;
    }
}

module.exports = Model;
