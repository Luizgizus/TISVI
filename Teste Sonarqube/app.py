import os
import requests
import time
import git

def download_repo(url):

    path = url.split('/')
    dir_name = "repositories/" + path[len(path) - 2] + "/"

    if not os.path.exists(dir_name):
        os.makedirs(dir_name)

    git.Git(dir_name).clone(url)

    return dir_name + path[len(path) - 1]

def analyze(path, key):

    command = 'cd ' + path + '&& sonar-scanner.bat -D"sonar.projectKey=' + key + '" -D"sonar.sources=." ' \
                 '-D"sonar.host.url=http://localhost:9000" -D"sonar.login=d06701b5ae30ca6a737aebd444e7ddf662ccec49"'
    os.system(command)

def createKey(name):
    data = {'name': name, 'project': name}
    requests.post('http://localhost:9000/api/projects/create', data=data)

def getMeasures(component):

    metrics = 'ncloc,complexity,violations,vulnerabilities,bugs,code_smells,functions,sqale_rating,reliability_rating,security_rating,lines_to_cover,duplicated_lines,duplicated_blocks,duplicated_files,lines,comment_lines,comment_lines_density,cognitive_complexity'
    x = requests.get('http://localhost:9000/api/measures/component?component='+component+'&metricKeys='+metrics)
    return x.json()

def exportCsv(data):
    fileName = 'metrics-' + str(int(time.time())) + '.csv'
    with open(fileName, 'a') as the_file:
        header = 'repository'
        line = data['component']['name']
        for item in data['component']['measures']:
            header += ',' + item['metric']
            line += ',' + item['value']

        the_file.write(header+'\n')
        the_file.write(line)


if __name__ == "__main__":
    print('Baixando repositório')
    path = download_repo('https://github.com/brianbruno/followgram_frontend')

    print('Criando Key')
    pathSplit = path.split('/')
    sonarName = pathSplit[len(pathSplit) - 2] + '_' + pathSplit[len(pathSplit) - 1]
    createKey(sonarName)

    print('Analisando repositório Sonarqube')
    analyze(path, sonarName)

    print('Upload informações')
    time.sleep(5)

    print('Retorno da Análise')
    returned = getMeasures(sonarName)

    print('Salvar dados')
    exportCsv(returned)