import os
import requests
import time
import git
import csv
import pandas as pd

FILE_NAME = None

def download_repo(url):

    path = url.split('/')
    dir_name = "repositories/" + path[len(path) - 2] + "/"

    if not os.path.exists(dir_name):
        os.makedirs(dir_name)

    git.Git(dir_name).clone(url)

    return dir_name + path[len(path) - 1]

def analyze(path, key):

    path = path.replace('.git', '')

    command = 'cd ' + path + '&& sonar-scanner.bat -D"sonar.projectKey=' + key + '" -D"sonar.sources=." ' \
                 '-D"sonar.host.url=http://infra.brian.place:32769" -D"sonar.login=0088090c339eeb581d77af487c7c264accb9ff03"'
    os.system(command)

def createKey(name):
    data = {'name': name, 'project': name}
    requests.post('http://infra.brian.place:32769/api/projects/create', data=data)

def getMeasures(component):

    metrics = 'ncloc,vulnerabilities,bugs,code_smells,reliability_rating,duplicated_lines,lines_to_cover,duplicated_blocks'
    x = requests.get('http://infra.brian.place:32769/api/measures/component?component='+component+'&metricKeys='+metrics)
    return x.json()

def ordenar(array, row):

    arrayAux = list()

    for item in row:
        for measure in array:
            if measure['metric'] == item:
                arrayAux.append(measure)

    return arrayAux

def exportCsv(data, fileName):

    row1 = ''

    if fileName is None:
        arquivoIniciado = False
        fileNameCsv = 'metrics-' + str(int(time.time())) + '.csv'
    else:
        arquivoIniciado = True
        fileNameCsv = fileName
        row1 = pd.read_csv(fileNameCsv, nrows=1)

    with open(fileNameCsv, 'a', newline='') as the_file:

        header = 'repository'
        line = data['component']['name']
        nloc = 0
        lines_to_cover = 1

        if arquivoIniciado:
            measures = ordenar(data['component']['measures'], row1)
        else:
            measures = data['component']['measures']

        for item in measures:
            if item['metric'] == 'nloc':
                nloc = item['value']
            if item['metric'] == 'lines_to_cover':
                lines_to_cover = item['value']
            
            header += ',' + item['metric']
            line += ',' + item['value']

        header  += ',tests'
        tests = int(nloc)/int(lines_to_cover)
        line += ',' + str(tests)

        if not arquivoIniciado:
            the_file.write(header+'\n')
            
        the_file.write(line+'\n')

    return fileNameCsv

def run(url_repo):

    global FILE_NAME

    print('Baixando repositório')
    path = download_repo(url_repo)

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
    FILE_NAME = exportCsv(returned, FILE_NAME)

if __name__ == "__main__":
    print('Analisador de repositórios')
    repos = [
        'https://github.com/jwd-ali/TidalTestProject.git',
        'https://github.com/jwd-ali/MusicSearch-SwiftUI.git',
        'https://github.com/ankitkanojia/dailyshop_react_redux.git',
        'https://github.com/ankitkanojia/iBitcoin-Crypto.git',
        'https://github.com/polm/boundless.git',
        'https://github.com/polm/palladian-facades.git',
        'https://github.com/denistsoi/shrug-emoji.git',
        'https://github.com/denistsoi/go-jokes.git',
        'https://github.com/cagri90/DemoServer.git',
        'https://github.com/cagri90/Interview.git',
    ]

    for repo in repos:
        run(repo)
    