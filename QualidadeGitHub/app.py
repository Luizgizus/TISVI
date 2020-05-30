import os
import requests
import time
import git
import csv
import pandas as pd
from contextlib import contextmanager
import sys, os

# FILE_NAME = None
FILE_NAME = 'metrics-1590775261.csv'

@contextmanager
def suppress_stdout():
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:  
            yield
        finally:
            sys.stdout = old_stdout

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
                 '-D"sonar.host.url=http://infra2.brian.place:32768" -D"sonar.login=c89ac9884e778d34700810d7a90f7b2aa41a21df"'
    os.system(command)

def createKey(name):
    data = {'name': name, 'project': name}
    requests.post('http://infra2.brian.place:32768/api/projects/create', data=data)

def getMeasures(component):

    metrics = 'ncloc,vulnerabilities,bugs,code_smells,reliability_rating,duplicated_lines,lines_to_cover,duplicated_blocks'
    x = requests.get('http://infra2.brian.place:32768/api/measures/component?component='+component+'&metricKeys='+metrics)
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
          'https://github.com/infinitered/bluepotion-template.git',
  'https://github.com/andrewhavens/devise-neo4j.git',
  'https://github.com/andrewhavens/redpotion.git',
  'https://github.com/andrewhavens/forecst.git',
  'https://github.com/andrewhavens/ProMotion.git',
  'https://github.com/andrewhavens/redpotion-dark-navbar-example.git',
  'https://github.com/andrewhavens/ProMotion-nil-title-screen-example.git',
  'https://github.com/andrewhavens/moticons.git',
  'https://github.com/andrewhavens/motion-toolbox.com.git',
  'https://github.com/bmichotte/ProMotion-XLForm.git',
  'https://github.com/andrewhavens/ProMotion-form.git',
  'https://github.com/andrewhavens/refinerycms-authentication-devise.git',
  'https://github.com/infinitered/whitepotion.git',
  'https://github.com/andrewhavens/blackpotion.git',
  'https://github.com/andrewhavens/motion-rest.git',
  'https://github.com/andrewhavens/bitrise.git',
  'https://github.com/andrewhavens/crittercism.git',
  'https://github.com/rubymotion-community/motion-authorization.git',
  'https://github.com/serpent5/SO53654020.git',
  'https://github.com/serpent5/Serpent5.Extensions.Configuration.git',
  'https://github.com/serpent5/Serpent5.Host.git',
  'https://github.com/serpent5/aspnet-Docs.git',
  'https://github.com/serpent5/mslearn-tailspin-spacegame-web.git',
  'https://github.com/serpent5/mslearn-tailspin-spacegame-web-models.git',
  'https://github.com/serpent5/mslearn-tailspin-spacegame-web-deploy.git',
  'https://github.com/serpent5/vscode-aspnetcore-docs.git',
  'https://github.com/bhristov96/batterycheckscript.git',
  'https://github.com/bhristov96/fix_redshift_randr_failed.git',
  'https://github.com/bhristov96/Change_Debian_boot_mode.git',
  'https://github.com/bhristov96/Mips_Assembly_Number_Diamond.git',
  'https://github.com/bhristov96/SIMD_simulation_with_MIPS_assembly.git',
  'https://github.com/bhristov96/AVL_tree.git',
  'https://github.com/bhristov96/blogPost-tutorials.git',
  'https://github.com/bhristov96/avl_c_sharp.git',
  'https://github.com/bhristov96/myvimrc.git',
  'https://github.com/bhristov96/PgwSlider.git',
  'https://github.com/bhristov96/slider.git',
  'https://github.com/bhristov96/dectobin.git',
  'https://github.com/bhristov96/cpp_neural_net.git',
  'https://github.com/bhristov96/lisp_dll.git',
  'https://github.com/bhristov96/Gen.git',
  'https://github.com/bhristov96/SnakeAI.git',
  'https://github.com/bhristov96/Learn_Deep_Learning_in_6_Weeks.git',
  'https://github.com/bhristov96/SQLPractice.git',
  'https://github.com/bhristov96/osc10e.git',
  'https://github.com/koennjb/py-medicalapp.git',
  'https://github.com/bhristov96/uwimg.git',
  'https://github.com/bhristov96/compton.git',
  'https://github.com/bhristov96/TopDeepLearning.git',
  'https://github.com/bhristov96/DenseDepth.git',
  'https://github.com/bhristov96/grokking-system-design.git',
  'https://github.com/bhristov96/.vim.git',
  'https://github.com/bhristov96/nvim.git',
  'https://github.com/Mysticial/Mini-Pi.git',
  'https://github.com/Mysticial/Flops.git',
  'https://github.com/Mysticial/sfft.git',
  'https://github.com/Mysticial/DigitViewer.git',
  'https://github.com/Mysticial/ProtoNTT.git',
  'https://github.com/Mysticial/FeatureDetector.git',
  'https://github.com/Mysticial/NumberFactory.git',
  'https://github.com/Mysticial/Sandbox.git',
  'https://github.com/Mysticial/y-cruncher-GUI.git',
  'https://github.com/Mysticial/y-cruncher.git',
  'https://github.com/Mysticial/y-cruncher-Formulas.git',
  'https://github.com/Mysticial/Pokemon-SwSh-Seed-Generator.git',
  'https://github.com/KhuramAli/GUI-Builder.git',
  'https://github.com/iamAzeem/CppPrimeNumberPrograms.git',
  'https://github.com/iamAzeem/CppMathematicalProblems.git',
  'https://github.com/iamAzeem/CppQtDemos.git',
  'https://github.com/iamAzeem/SSIC.git',
  'https://github.com/iamAzeem/TcpClientServerApp.git',
  'https://github.com/iamAzeem/General.git',
  'https://github.com/iamAzeem/CppCon2014.git',
  'https://github.com/iamAzeem/CppCon2015.git',
  'https://github.com/iamAzeem/GmailArchiver.git',
  'https://github.com/iamAzeem/gitignore.git',
  'https://github.com/iamAzeem/qt-solutions.git',
  'https://github.com/iamAzeem/SingleApplication.git',
  'https://github.com/iamAzeem/design-patterns.git',
  'https://github.com/iamAzeem/cpp-cheat-sheet.git',
  'https://github.com/iamAzeem/git.git',
  'https://github.com/iamAzeem/linux.git',
  'https://github.com/iamAzeem/IncludeOS.git',
  'https://github.com/iamAzeem/thor-os.git',
  'https://github.com/iamAzeem/syslog-win32.git',
  'https://github.com/iamAzeem/SimpleBlockchain.git',
  'https://github.com/piotr-skotnicki/tc-optimizer.git',
  'https://github.com/piotr-skotnicki/bsc-compiler.git',
  'https://github.com/piotr-skotnicki/msc-refactoring.git',
  'https://github.com/piotr-skotnicki/cpp-expression.git'
  'https://github.com/drewnoakes/InstantSprite.git',
  'https://github.com/drewnoakes/rapidjson.git',
  'https://github.com/drewnoakes/metadata-extractor.git',
  'https://github.com/drewnoakes/metadata-extractor-images.git',
  'https://github.com/drewnoakes/lwsxx.git',
  'https://github.com/drewnoakes/camshaft.git',
  'https://github.com/drewnoakes/flux.git',
  'https://github.com/drewnoakes/netmq.git',
  'https://github.com/drewnoakes/pyzmqnotes.git',
  'https://github.com/point-platform/cassette.git',
  'https://github.com/point-platform/boing.git',
  'https://github.com/andysturrock/cassettej.git',
  'https://github.com/drewnoakes/xmp-core-dotnet.git',
  'https://github.com/drewnoakes/metadata-extractor-dotnet.git',
  'https://github.com/drewnoakes/msgpack-cli.git',
  'https://github.com/drewnoakes/dependency-analyser.git',
  'https://github.com/point-platform/dasher.git',
  'https://github.com/NetMQ/Zyre.git',
  'https://github.com/drewnoakes/NetMQ3-x.git',
  'https://github.com/drewnoakes/console.git',
  'https://github.com/drewnoakes/style-snooper.git',
  'https://github.com/point-platform/servant.git',
  'https://github.com/drewnoakes/AgentSmith.git',
  'https://github.com/drewnoakes/adobe-xmp-core.git',
  'https://github.com/drewnoakes/Font-Awesome-WPF.git',
  'https://github.com/drewnoakes/il-visualizer.git',
  'https://github.com/drewnoakes/roslyn.git',
  'https://github.com/drewnoakes/redux.git',
  'https://github.com/drewnoakes/exif-processor.git',
  'https://github.com/drewnoakes/visualstudio-docs.git',
  'https://github.com/point-platform/famfamfam-flags-wpf.git',
  'https://github.com/zahlman/join.py.git',
  'https://github.com/zahlman/bakedbeans.git',
  'https://github.com/zahlman/indexify.git',
  'https://github.com/zahlman/json_bpatch.git',
  'https://github.com/zahlman/TiddlyWiki5.git',
  'https://github.com/aakashgarg19/Programs.git',
  'https://github.com/aakashgarg19/Codes.git',
  'https://github.com/aakashgarg19/gitShowCase.git',
  'https://github.com/aakashgarg19/TodoWeb.git',
  'https://github.com/aakashgarg19/TodoServer.git',
  'https://github.com/aakashgarg19/tfjs-examples.git',
  'https://github.com/aakashgarg19/research-platform.git',
  'https://github.com/aakashgarg19/compodoc.git',
  'https://github.com/aakashgarg19/grappus-task.git',
  'https://github.com/aakashgarg19/bluestacks-challenge.git',
  'https://github.com/aakashgarg19/ng-multiselect-dropdown.git',
  'https://github.com/aakashgarg19/ie-textarea-scrollable.git',
  'https://github.com/aakashgarg19/updatedportfolio.git',
  'https://github.com/aakashgarg19/async-css.git',
  'https://github.com/marcosc90/node-jsdifflib.git',
  'https://github.com/marcosc90/vtex-uploader-sublime.git',
  'https://github.com/ethernalbridge/ethernalbridge.git',
  'https://github.com/marcosc90/express-busboy.git',
  'https://github.com/marcosc90/eslint-plugin-newline-after-if-condition.git',
  'https://github.com/marcosc90/express-superstruct.git',
  'https://github.com/marcosc90/node-bandwidth.git',
  'https://github.com/marcosc90/node-s3-client.git',
  'https://github.com/marcosc90/downldr.git',
  'https://github.com/marcosc90/node.git',
  'https://github.com/marcosc90/deno.git',
  'https://github.com/marcosc90/minimist.git',
  'https://github.com/mayconmesquita/perm.git',
  'https://github.com/mayconmesquita/behmor-artisan.git',
  'https://github.com/mayconmesquita/blingApi2.git',
  'https://github.com/mayconmesquita/iot-arduino-smart-home.git',
  'https://github.com/mayconmesquita/mayconmesquita.github.io.git',
  'https://github.com/mayconmesquita/xlsx-parse-json.git',
  'https://github.com/mayconmesquita/react-native-gifted-chat.git',
  'https://github.com/mayconmesquita/react.git',
  'https://github.com/mayconmesquita/react-native-action-button.git',
  'https://github.com/mayconmesquita/react-native-image-capinsets-next.git',
  'https://github.com/mayconmesquita/iconerator-next.git',
  'https://github.com/mayconmesquita/react-native-rename-next.git',
  'https://github.com/mayconmesquita/react-native-navigation.git',
  'https://github.com/mayconmesquita/react-color.git',
  'https://github.com/mayconmesquita/react-bootstrap-range-slider.git',
  'https://github.com/mayconmesquita/CoronaNotifier.git',
  'https://github.com/mayconmesquita/express-redis-cache-next.git',
  'https://github.com/ExplodingCabbage/jinja.git',
  'https://github.com/ExplodingCabbage/google-auth-library-python.git',
  'https://github.com/ExplodingCabbage/jsfiddle-issues.git',
  'https://github.com/ExplodingCabbage/flask.git',
  'https://github.com/ExplodingCabbage/telegraf.git',
  'https://github.com/curative/oatmeal-protocol.git',
  'https://github.com/ExplodingCabbage/preloadImage-test.git',
  'https://github.com/ExplodingCabbage/Basecalling-comparison.git',
  'https://github.com/ExplodingCabbage/DeepSimulator.git',
  'https://github.com/ExplodingCabbage/NanoSim-H.git',
  'https://github.com/ExplodingCabbage/kraken.git',
  'https://github.com/ExplodingCabbage/biopython.git',
  'https://github.com/ExplodingCabbage/biopython.github.io.git',
  'https://github.com/ExplodingCabbage/ec2instances.info.git',
  'https://github.com/ExplodingCabbage/qcat.git',
  'https://github.com/ExplodingCabbage/pysam.git',
  'https://github.com/ExplodingCabbage/php-src.git',
  'https://github.com/curative/py_TE_controller.git',
  'https://github.com/ExplodingCabbage/jq-orb.git',
  'https://github.com/ExplodingCabbage/sqlalchemy.git'
    ]

    i = 0

    for repo in repos:
            
        try:
            i += 1
            print(str(i) + '/' + str(len(repos)))
            with suppress_stdout():
                run(repo)
        except Exception as e:
            print("ERRO! Repositório: " + repo)
            print(str(e))
    