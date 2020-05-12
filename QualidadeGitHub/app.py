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
          'https://github.com/jwd-ali/SBAActionSheetPicker.git',
        'https://github.com/shoaib-akhtar/SBAImagePickerController.git',
        'https://github.com/jwd-ali/DateTimePicker.git',
        'https://github.com/jwd-ali/SBAImagePickerController.git',
        'https://github.com/jwd-ali/IOS-Portfolio.git',
        'https://github.com/jwd-ali/ReadabilityKit.git',
        'https://github.com/jwd-ali/Smart-Lazy-Loading.git',
        'https://github.com/jwd-ali/TidalTestProject.git',
        'https://github.com/jwd-ali/MusicSearch-SwiftUI.git',
        'https://github.com/jwd-ali/TidalAssignment.git',
        'https://github.com/jwd-ali/CircularLabel.git',
        'https://github.com/jwd-ali/Circular.git',
        'https://github.com/jwd-ali/WHCollapsiblePieChart.git',
        'https://github.com/jwd-ali/RingPieChart.git',
        'https://github.com/jwd-ali/ProgressImageView.git',
        'https://github.com/jwd-ali/GradientView.git',
        'https://github.com/jwd-ali/SwiftStructures.git',
        'https://github.com/jwd-ali/CircularAnimation.git',
        'https://github.com/ankitkanojia/bidcontent_v1.git',
        'https://github.com/ankitkanojia/socketchat-nodejs-reactjs.git',
        'https://github.com/ankitkanojia/election.git',
        'https://github.com/ankitkanojia/eth-todo-list.git',
        'https://github.com/ankitkanojia/kratos.git',
        'https://github.com/ankitkanojia/walletly-app.git',
        'https://github.com/ankitkanojia/react-fusion-columnchart.git',
        'https://github.com/ankitkanojia/react-fusioncharts-component.git',
        'https://github.com/ankitkanojia/react-fusion-barchart.git',
        'https://github.com/ankitkanojia/react-fusion-linechart.git',
        'https://github.com/ankitkanojia/eCommerce_Shop.git',
        'https://github.com/ankitkanojia/react-fusion-mapchart.git',
        'https://github.com/ankitkanojia/dailyshop_react_redux.git',
        'https://github.com/ankitkanojia/iBitcoin-Crypto.git',
        'https://github.com/ankitkanojia/devtracker_v2.git',
        'https://github.com/ankitkanojia/devtracker_v1.git',
        'https://github.com/ankitkanojia/card.git',
        'https://github.com/ankitkanojia/react-js-pagination.git',
        'https://github.com/ankitkanojia/simplest-redux-example.git',
        'https://github.com/ankitkanojia/ImagePicker.git',
        'https://github.com/ankitkanojia/eClinic.git',
        'https://github.com/ankitkanojia/Ratchet.git',
        'https://github.com/ankitkanojia/redux.git',
        'https://github.com/ankitkanojia/android-material-design-icon-generator-plugin.git',
        'https://github.com/ankitkanojia/material-icon-generator-plugin.git',
        'https://github.com/ankitkanojia/COSAdmin.git',
        'https://github.com/ankitkanojia/draggable-droppable.git',
        'https://github.com/ankitkanojia/react_basic_components.git',
        'https://github.com/ankitkanojia/Payment-Gateways.git',
        'https://github.com/ankitkanojia/react-crypt-gsm.git',
        'https://github.com/ankitkanojia/node-crypt.git',
        'https://github.com/ankitkanojia/react-game-findway.git',
        'https://github.com/ankitkanojia/memory-game.git',
        'https://github.com/ankitkanojia/tic-tac-toe.git',
        'https://github.com/ankitkanojia/jigsaw-puzzle.git',
        'https://github.com/ankitkanojia/slide-puzzle.git',
        'https://github.com/ankitkanojia/react-image-crop.git',
        'https://github.com/ankitkanojia/DotNetCharts.git',
        'https://github.com/ankitkanojia/Leaflet.git',
        'https://github.com/ankitkanojia/ColorPicker.git',
        'https://github.com/ankitkanojia/Twilio-Video-Chat.git',
        'https://github.com/ankitkanojia/create-react-app.git',
        'https://github.com/ankitkanojia/Twilio-Text-Chat.git',
        'https://github.com/ankitkanojia/SignalRChat.git',
        'https://github.com/ankitkanojia/image-cropper.git',
        'https://github.com/ankitkanojia/realtimechat.git',
        'https://github.com/ankitkanojia/firebase-react.git',
        'https://github.com/polm/noriega.git',
        'https://github.com/polm/dwm.git',
        'https://github.com/polm/scribe.git',
        'https://github.com/polm/akihabara.git',
        'https://github.com/polm/fluentd.org.git',
        'https://github.com/polm/everybayes.git',
        'https://github.com/polm/artificier.git',
        'https://github.com/polm/chargen.git',
        'https://github.com/polm/enchant.js.git',
        'https://github.com/polm/enchant.js-builds.git',
        'https://github.com/polm/transparency.git',
        'https://github.com/polm/mori.git',
        'https://github.com/SamuraiT/mecab-python3.git',
        'https://github.com/polm/deltos.git',
        'https://github.com/polm/equaeverpoise.git',
        'https://github.com/polm/deltos.vim.git',
        'https://github.com/polm/dupdupdraw.git',
        'https://github.com/polm/locust.git',
        'https://github.com/polm/gutenjuice.git',
        'https://github.com/polm/rn.git',
        'https://github.com/polm/quickjdict.git',
        'https://github.com/polm/boundless.git',
        'https://github.com/polm/palladian-facades.git',
        'https://github.com/polm/bontan.git',
        'https://github.com/polm/searchy.git',
        'https://github.com/polm/node-migemo.git',
        'https://github.com/polm/dotfiles.old.git',
        'https://github.com/polm/bitdissolver.git',
        'https://github.com/polm/Emphasis.git',
        'https://github.com/polm/philtre.git',
        'https://github.com/polm/sketch-rnn.git',
        'https://github.com/polm/node-charm.git',
        'https://github.com/polm/npm.git',
        'https://github.com/polm/ichimatsu.git',
        'https://github.com/polm/char-rnn.git',
        'https://github.com/polm/gamefaces.git',
        'https://github.com/polm/github-tasks.vim.git',
        'https://github.com/polm/deltos-default-theme.git',
        'https://github.com/polm/mimi-grep.git',
        'https://github.com/polm/bigtext.git',
        'https://github.com/polm/show-footnotes.git',
        'https://github.com/polm/showmemore.git',
        'https://github.com/polm/twitter.git',
        'https://github.com/polm/pixelbox.git',
        'https://github.com/polm/lua-mecab.git',
        'https://github.com/polm/isorogue.git',
        'https://github.com/polm/jfmt.lua.git',
        'https://github.com/polm/shesha.git',
        'https://github.com/polm/Articles.git',
        'https://github.com/polm/bones.git',
        'https://github.com/polm/spaCy.git',
        'https://github.com/polm/pinput.git',
        'https://github.com/polm/mecab.git',
        'https://github.com/polm/fuzzywuzzy.git',
        'https://github.com/polm/lexcavator.git',
        'https://github.com/polm/gensim.git',
        'https://github.com/polm/spacy-dev-resources.git',
        'https://github.com/polm/mecab-packed.git',
        'https://github.com/polm/awesome-gamedev-jp.git',
        'https://github.com/polm/awesome-digital-collections.git',
        'https://github.com/polm/ndl-crop.git',
        'https://github.com/polm/fastText.git',
        'https://github.com/polm/UD_Japanese-GSD.git',
        'https://github.com/polm/yon.git',
        'https://github.com/polm/mecab-python3.git',
        'https://github.com/polm/visidata.git',
        'https://github.com/polm/jp-ner.git',
        'https://github.com/polm/SudachiPy.git',
        'https://github.com/polm/preshed.git',
        'https://github.com/polm/srsly.git',
        'https://github.com/polm/yuzulabo.works.git',
        'https://github.com/polm/fugashi.git',
        'https://github.com/polm/ja-tokenizer-benchmark.git',
        'https://github.com/polm/posuto.git',
        'https://github.com/polm/argh.git',
        'https://github.com/polm/unidic-py.git',
        'https://github.com/polm/mecab-manylinux1-wheel-builder.git',
        'https://github.com/polm/unidic-lite.git',
        'https://github.com/polm/cutlet.git',
        'https://github.com/polm/kanji.git',
        'https://github.com/polm/laserembeddings.git',
        'https://github.com/polm/transformers.git',
        'https://github.com/polm/ginza.git',
        'https://github.com/denistsoi/mapboxgl-spiderifier.git',
        'https://github.com/denistsoi/mapbox-gl-js.git',
        'https://github.com/denistsoi/here-be-dragons.git',
        'https://github.com/denistsoi/react-demos.git',
        'https://github.com/denistsoi/express-crud.git',
        'https://github.com/denistsoi/challenge.git',
        'https://github.com/denistsoi/mater.git',
        'https://github.com/denistsoi/devops-coding-challenge.git',
        'https://github.com/denistsoi/kubernetes-challenge.git',
        'https://github.com/denistsoi/devops-challenges.git',
        'https://github.com/denistsoi/challenge01.git',
        'https://github.com/denistsoi/devops-code-challenge.git',
        'https://github.com/denistsoi/DevOps-Challenges-Cycle1.git',
        'https://github.com/denistsoi/devops-coding-challenge-1.git',
        'https://github.com/denistsoi/devops-challenge.git',
        'https://github.com/denistsoi/devops-challenge-apps.git',
        'https://github.com/denistsoi/kd.git',
        'https://github.com/denistsoi/keto.git',
        'https://github.com/denistsoi/room.js.git',
        'https://github.com/denistsoi/dt-docker.git',
        'https://github.com/denistsoi/python-patterns.git',
        'https://github.com/paul-spangfort/Halendr_Company_Client.git',
        'https://github.com/denistsoi/kubernetes-mongodb-shard.git',
        'https://github.com/denistsoi/js-meter.git',
        'https://github.com/denistsoi/node-slate.git',
        'https://github.com/denistsoi/dt-mongo-utils.git',
        'https://github.com/denistsoi/skygear-apitable.git',
        'https://github.com/wiesson/eb-export.git',
        'https://github.com/denistsoi/sendgrid-nodejs.git',
        'https://github.com/denistsoi/shrug-emoji.git',
        'https://github.com/denistsoi/go-jokes.git',
        'https://github.com/denistsoi/messaging-apis.git',
        'https://github.com/denistsoi/AlgoCasts.git',
        'https://github.com/denistsoi/scripts.git',
        'https://github.com/denistsoi/cli-draw.git',
        'https://github.com/denistsoi/game-of-life.git',
        'https://github.com/denistsoi/transcription-service.git',
        'https://github.com/denistsoi/recompose.git',
        'https://github.com/denistsoi/rg.git',
        'https://github.com/denistsoi/01-banking-app.git',
        'https://github.com/denistsoi/kinto-cli.git',
        'https://github.com/denistsoi/kinto-jokes.git',
        'https://github.com/denistsoi/gatsby-starter-netlify-cms.git',
        'https://github.com/denistsoi/social-media-safety-asylum-seekers.git',
        'https://github.com/denistsoi/refoodie-api.git',
        'https://github.com/denistsoi/refoodie-app.git',
        'https://github.com/denistsoi/payment-icons.git',
        'https://github.com/denistsoi/kintohub-docs.git',
        'https://github.com/denistsoi/kinto-test.git',
        'https://github.com/denistsoi/icame4dalolz.git',
        'https://github.com/denistsoi/looper.git',
        'https://github.com/denistsoi/fanatic.git',
        'https://github.com/denistsoi/kinto-vue.git',
        'https://github.com/denistsoi/chart-parts.git',
        'https://github.com/denistsoi/notebooks.git',
        'https://github.com/denistsoi/cathay-hackathon-2018.git',
        'https://github.com/denistsoi/proton.git',
        'https://github.com/denistsoi/vue-menu.git',
        'https://github.com/denistsoi/vuesax.git',
        'https://github.com/denistsoi/wesleychang.git',
        'https://github.com/denistsoi/vue-vimeo-player.git',
        'https://github.com/Calebyang93/Necessiti-Web-App-.git',
        'https://github.com/denistsoi/hubpress.io.git',
        'https://github.com/denistsoi/tables-hugo.git',
        'https://github.com/denistsoi/tables-vuepress-example.git',
        'https://github.com/denistsoi/tables-vuepress.git',
        'https://github.com/denistsoi/cypress-recorder.git',
        'https://github.com/denistsoi/JsonSurfer.git',
        'https://github.com/denistsoi/react-native-paper.git',
        'https://github.com/denistsoi/yoga.git',
        'https://github.com/denistsoi/react-native-datepicker.git',
        'https://github.com/denistsoi/heroicons-ui.git',
        'https://github.com/denistsoi/graphql-engine.git',
        'https://github.com/denistsoi/vue-meta.git',
        'https://github.com/denistsoi/hasura-graphql-hk-dec-2019.git',
        'https://github.com/denistsoi/charts.git',
        'https://github.com/denistsoi/selfdefined.git',
        'https://github.com/denistsoi/sanity-nextjs-landing-pages.git',
        'https://github.com/denistsoi/twitter-client-example.git',
        'https://github.com/denistsoi/python_practitioner.git',
        'https://github.com/denistsoi/python-code-for-hk.git',
        'https://github.com/denistsoi/multiplayer-game-of-life.git',
        'https://github.com/denistsoi/01_fyyur.git',
        'https://github.com/denistsoi/udacity-reviews.git',
        'https://github.com/denistsoi/storybookvueaddonstest.git',
        'https://github.com/denistsoi/02_trivia_api.git',
        'https://github.com/denistsoi/warsinhk.git',
        'https://github.com/denistsoi/socialapp.git',
        'https://github.com/denistsoi/03_coffee_shop.git',
        'https://github.com/denistsoi/FSND-Deploy-Flask-App-to-Kubernetes-Using-EKS.git',
        'https://github.com/denistsoi/udacity-capstone.git',
        'https://github.com/denistsoi/vite-tailwind-starter.git',
        'https://github.com/denistsoi/devops-intro-project.git',
        'https://github.com/denistsoi/rnTranslatedBible.git',
        'https://github.com/denistsoi/managers-playbook.git',
        'https://github.com/denistsoi/building-small-blog.git',
        'https://github.com/denistsoi/hasura-tutorial.git',
        'https://github.com/denistsoi/react-native-gesture-detector.git',
        'https://github.com/denistsoi/rn-formly.git',
        'https://github.com/denistsoi/system.git',
        'https://github.com/cagri90/ab2015-android-a.git',
        'https://github.com/cagri90/DemoServer.git',
        'https://github.com/cagri90/Interview.git',
        'https://github.com/cagri90/apiinterview.git'
    ]

    for repo in repos:
        run(repo)
    