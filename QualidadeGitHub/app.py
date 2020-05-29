import os
import requests
import time
import git
import csv
import pandas as pd
from contextlib import contextmanager
import sys, os

# FILE_NAME = None
FILE_NAME = 'metrics.csv'

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
          'https://github.com/wallacemaxters/jquery-object-form.git',
'https://github.com/wallacemaxters/ipinfo.git',
'https://github.com/wallacemaxters/facebook-sdk-laravel.git',
'https://github.com/wallacemaxters/laravel3.git',
'https://github.com/wallacemaxters/sevenframework.git',
'https://github.com/wallacemaxters/facebook.git',
'https://github.com/wallacemaxters/timer.git',
'https://github.com/wallacemaxters/itertools.git',
'https://github.com/wallacemaxters/tutorial-php.git',
'https://github.com/wallacemaxters/forms.git',
'https://github.com/wallacemaxters/exemplo-php-crop.git',
'https://github.com/wallacemaxters/ng-laravel-paginator.git',
'https://github.com/jfbueno/Gifxters.git',
'https://github.com/wallacemaxters/wm-laravel-lazy-load.git',
'https://github.com/wallacemaxters/wm-modal.git',
'https://github.com/wallacemaxters/angular-wm-socket-channel.git',
'https://github.com/wallacemaxters/wm-quill.git',
'https://github.com/brcontainer/jot.js.git',
'https://github.com/wallacemaxters/jot.js.git',
'https://github.com/wallacemaxters/wallacemaxters.github.io.git',
'https://github.com/wallacemaxters/vue-cli-recordrtc.git',
'https://github.com/Isaiasdd/utils.git',
'https://github.com/pablotdv/EstadoCidadeAjax.git',
'https://github.com/pablotdv/MvcPlugins.git',
'https://github.com/DesignLiquido/Flot.Mvc.git',
'https://github.com/pablotdv/Curso-Java-OO.git',
'https://github.com/pablotdv/StackOverflow.git',
'https://github.com/ostsm/CodCraftEx02.git',
'https://github.com/pablotdv/MvcApplicationRazorGeneratorSeparateLibrary.git',
'https://github.com/pablotdv/Aspnet-Identity-Guid.git',
'https://github.com/DesignLiquido/pagseguro-dotnet.git',
'https://github.com/pablotdv/CursoCodingCraft-01.git',
'https://github.com/pablotdv/Truco.git',
'https://github.com/pablotdv/Estudos.git',
'https://github.com/pablotdv/MaratonaXamarin.git',
'https://github.com/pablotdv/pablotdv.github.io.git',
'https://github.com/pablotdv/ControleCorrida.git',
'https://github.com/pablotdv/GoogleCharts.git',
'https://github.com/pablotdv/Docs.git',
'https://github.com/pablotdv/XamarinUniversity.git',
'https://github.com/pablotdv/BlogEngine.NET.git',
'https://github.com/pablotdv/AmmegBlog.git',
'https://github.com/pablotdv/docs-1.git',
'https://github.com/pablotdv/XamarinFestPUCRS.git',
'https://github.com/pablotdv/IntegracaoDominioSistemas.git',
'https://github.com/pablotdv/MaratonaXamarinIntermediaria.git',
'https://github.com/pablotdv/ExemplosBlog.git',
'https://github.com/pablotdv/develop-mobile-apps-with-csharp-and-azure.git',
'https://github.com/pablotdv/bugnet.git',
'https://github.com/pablotdv/CursoCodingCraft-02.git',
'https://github.com/pablotdv/awesome-xamarin.git',
'https://github.com/pablotdv/blog-WebAPIVersion.git',
'https://github.com/pablotdv/pluralsight-angular-getting-started.git',
'https://github.com/pablotdv/FileHelpers.git',
'https://github.com/pablotdv/CodingCraftEX06HangFire.git',
'https://github.com/pablotdv/MTA-98-361.git',
'https://github.com/pablotdv/WebApplication3.git',
'https://github.com/pablotdv/IdentityServerSamples.git',
'https://github.com/pablotdv/MvcEntityFrameworkReportViewer.git',
'https://github.com/pablotdv/aspnet-core.git',
'https://github.com/pablotdv/Blogifier.git',
'https://github.com/pablotdv/ExemploAjaxPartialView.git',
'https://github.com/pablotdv/Competicoes.git',
'https://github.com/pablotdv/youtube-curso-angular.git',
'https://github.com/pablotdv/VideoEntityFrameworkCore.git',
'https://github.com/pablotdv/webpack-demo.git',
'https://github.com/pablotdv/safewebfornecedores.git',
'https://github.com/pablotdv/EntityFramework.Docs.git',
'https://github.com/pablotdv/andritz.git',
'https://github.com/pablotdv/ProvaCWI.git',
'https://github.com/pablotdv/ASP.NET-MVC-Scaffolding.git',
'https://github.com/pablotdv/tracker-enabled-dbcontext.git',
'https://github.com/pablotdv/pluralsight-csharp-equality-and-comparisons.git',
'https://github.com/LeonardoBonetti/GAME-COSMIC-JS-HTML5.git',
'https://github.com/LeonardoBonetti/LoadJsonFileUnity.git',
'https://github.com/LeonardoBonetti/WriteJsonFileUnity.git',
'https://github.com/LeonardoBonetti/dev-podcast-list-brazil.git',
'https://github.com/LeonardoBonetti/skip-to-content.git',
'https://github.com/LeonardoBonetti/iniciantes.git',
'https://github.com/LeonardoBonetti/VerifyAge_JsFuncional.git',
'https://github.com/LeonardoBonetti/workshop-js-funcional-free.git',
'https://github.com/LeonardoBonetti/collatz_conjecture.git',
'https://github.com/LeonardoBonetti/Sistema-de-dialogo-Unity-engine.git',
'https://github.com/LeonardoBonetti/CSGO-Royall.git',
'https://github.com/LeonardoBonetti/Validatinator.git',
'https://github.com/LeonardoBonetti/Responsive-Grid-System-CSS.git',
'https://github.com/LeonardoBonetti/Desvendando-Javascript.git',
'https://github.com/LeonardoBonetti/mostly-adequate-guide-pt-BR.git',
'https://github.com/LeonardoBonetti/comandos-basicos-github.git',
'https://github.com/LeonardoBonetti/mixitup.git',
'https://github.com/LeonardoBonetti/linux.git',
'https://github.com/LeonardoBonetti/telegram-br.git',
'https://github.com/LeonardoBonetti/atomicArray.git',
'https://github.com/LeonardoBonetti/FiscSoft-website.git',
'https://github.com/LeonardoBonetti/rodrigo.github.io.git',
'https://github.com/LeonardoBonetti/Estudo_MySql.Data.MySqlClient.git',
'https://github.com/LeonardoBonetti/control-user-cursor.git',
'https://github.com/LeonardoBonetti/Foxxys.git',
'https://github.com/LeonardoBonetti/jQuery-Mask-Plugin.git',
'https://github.com/LeonardoBonetti/Foxxsys.git',
'https://github.com/LeonardoBonetti/metadata-extractor-dotnet.git',
'https://github.com/LeonardoBonetti/Newtonsoft.Json.git',
'https://github.com/LeonardoBonetti/dotnet-docs-samples.git',
'https://github.com/LeonardoBonetti/hacktoberfest.git',
'https://github.com/LeonardoBonetti/memory-game.git',
'https://github.com/LeonardoBonetti/curiosity.git',
'https://github.com/LeonardoBonetti/Hacktoberfest-2k17.git',
'https://github.com/LeonardoBonetti/first-contributions.git',
'https://github.com/LeonardoBonetti/FiscSoftJava.git',
'https://github.com/LeonardoBonetti/Mime-Detective.git',
'https://github.com/LeonardoBonetti/CriptoBroker.git',
'https://github.com/LeonardoBonetti/Vindi.git',
'https://github.com/LeonardoBonetti/leonardobonetti.github.io.git',
'https://github.com/LeonardoBonetti/LetsEncrypt.git',
'https://github.com/LeonardoBonetti/win-acme.git',
'https://github.com/LeonardoBonetti/flask-pytest-example.git',
'https://github.com/LeonardoBonetti/CadastroUsuarioPython.git',
'https://github.com/LeonardoBonetti/React.git',
'https://github.com/LeonardoBonetti/create-react-app.git',
'https://github.com/LeonardoBonetti/Curso-React-1-Alura.git',
'https://github.com/LeonardoBonetti/EquinoxProject.git',
'https://github.com/LeonardoBonetti/meu-primeiro-jogo-multiplayer.git',
'https://github.com/LeonardoBonetti/Aposentei_.git',
'https://github.com/artptrapp/slackbot.git',
'https://github.com/artptrapp/grenal-407.github.io.git',
'https://github.com/artptrapp/SpotTalk.git',
'https://github.com/wllfaria/darkmoon.git',
'https://github.com/artptrapp/feluma-site.git',
'https://github.com/artptrapp/TypeScript-Node-Starter.git',
'https://github.com/jlHertel/simple-doctrine-orm.git',
'https://github.com/jlHertel/mesa-pelican.git',
'https://github.com/jlHertel/mesa-sphinx.git',
'https://github.com/jlHertel/simple-serializer-collection.git',
'https://github.com/jlHertel/adriconf.git',
'https://github.com/flathub/br.com.jeanhertel.adriconf.git',
'https://github.com/jlHertel/libdriconfig.git',
'https://github.com/brumazzi/Weblg-Light.git',
'https://github.com/brumazzi/anima-o-circulando.git',
'https://github.com/brumazzi/Criptogradia_de_Cesar.git',
'https://github.com/LucaSouza/SYS-HELP-.git',
'https://github.com/brumazzi/pilha_stack.git',
'https://github.com/brumazzi/Threads.git',
'https://github.com/brumazzi/parking-app.git',
'https://github.com/brumazzi/python_args_kwds.git',
'https://github.com/brumazzi/Cherrypy_HelloWorld.git',
'https://github.com/brumazzi/htmlgen.git',
'https://github.com/brumazzi/htmlgen-1.1.2.git',
'https://github.com/brumazzi/Cherrypy_-_mysql.git',
'https://github.com/brumazzi/Cifra_de_Vigenere.git',
'https://github.com/brumazzi/Sistema_Bancario.git',
'https://github.com/brumazzi/Snow_Rain_JS.git',
'https://github.com/brumazzi/Easy-Spinner.git',
'https://github.com/brumazzi/Key-Hook.git',
'https://github.com/brumazzi/Signal---Tratamento-de-erros.git',
'https://github.com/brumazzi/brumazzi.github.io.git',
'https://github.com/brumazzi/html5lib-python.git',
'https://github.com/brumazzi/JSS.git',
'https://github.com/brumazzi/code_complete.git',
'https://github.com/brumazzi/Vim-Code-Compile.git',
'https://github.com/brumazzi/Wifi-Lan.git',
'https://github.com/brumazzi/DJango-Exemples.git',
'https://github.com/brumazzi/Hidding-in-Bitmap.git',
'https://github.com/brumazzi/Curriculum_Conscienciologico.git',
'https://github.com/brumazzi/Canvas_JS.git',
'https://github.com/brumazzi/Python2.x-Exemples.git',
'https://github.com/brumazzi/JavaScript-Exemples.git',
'https://github.com/brumazzi/WebSocket.git',
'https://github.com/brumazzi/NodeJS-Exemples.git',
'https://github.com/brumazzi/WebChat.git',
'https://github.com/brumazzi/Garden-Framework.git',
'https://github.com/brumazzi/C-Exemples.git',
'https://github.com/brumazzi/Easy-DBManager.git',
'https://github.com/brumazzi/SysHook.git',
'https://github.com/brumazzi/Love2D-Samples.git',
'https://github.com/brumazzi/Batalha-naval---RPC.git',
'https://github.com/brumazzi/i3blocks-sh.git',
'https://github.com/brumazzi/samples.git',
'https://github.com/brumazzi/3d-wallpaper.git',
'https://github.com/brumazzi/ColladaCpp.git',
'https://github.com/brumazzi/getnet_api.git',
'https://github.com/cegesser/http-test.git',
'https://github.com/cegesser/xpress.git',
'https://github.com/cegesser/imageproc.git',
'https://github.com/cegesser/nano_state_machine.git',
'https://github.com/cegesser/gals.git',
'https://github.com/cegesser/polyvisit.git',
'https://github.com/darcamo/MATLAB_Funcs.git',
'https://github.com/darcamo/epsfrag2pdf.git',
'https://github.com/darcamo/tikz-mimo-shapes.git',
'https://github.com/darcamo/darcamo.github.com.git',
'https://github.com/darcamo/pyphysim.git',
'https://github.com/darcamo/pbs-script-generator.git',
'https://github.com/darcamo/.emacs.d.git',
'https://github.com/darcamo/sir_colormaps.git',
'https://github.com/darcamo/learning.git',
'https://github.com/darcamo/frontend-nanodegree-resume.git',
'https://github.com/darcamo/fullstack-nanodegree-vm.git',
'https://github.com/darcamo/my-pandoc-filters.git',
'https://github.com/darcamo/pyuploader.git',
'https://github.com/darcamo/python-crash-course.git',
'https://github.com/darcamo/educacao-a-distancia.git',
'https://github.com/darcamo/Flexget.git',
'https://github.com/darcamo/python-and-numpy-course.git',
'https://github.com/darcamo/array-sensor-homeworks.git',
'https://github.com/darcamo/.spacemacs.d.git',
'https://github.com/darcamo/python-16h-course.git',
'https://github.com/darcamo/simula_conta.git',
'https://github.com/darcamo/ranges_v3_test.git',
'https://github.com/darcamo/test_libraries.git',
'https://github.com/darcamo/conan-recipes.git',
'https://github.com/darcamo/conan-lapack.git',
'https://github.com/darcamo/conan-openblas.git',
'https://github.com/darcamo/conan-hdf5.git',
'https://github.com/darcamo/conan-armadillo.git',
'https://github.com/darcamo/conan-configuru.git',
'https://github.com/darcamo/conan-cxxopts.git',
'https://github.com/darcamo/conan-dkm.git',
'https://github.com/darcamo/conan-ezprogressbar.git',
'https://github.com/darcamo/conan-sigpack.git',
'https://github.com/darcamo/conan-imgui-sfml.git',
'https://github.com/darcamo/conan-nlohmann_json.git',
'https://github.com/darcamo/conan-xtl.git',
'https://github.com/darcamo/conan-xtensor.git',
'https://github.com/darcamo/conan-xtensor-blas.git',
'https://github.com/darcamo/conan-fftw.git',
'https://github.com/darcamo/connan-xtensor-fftw.git',
'https://github.com/darcamo/conan-xsimd.git',
'https://github.com/darcamo/xtensor-io.git',
'https://github.com/darcamo/conan-libharu.git',
'https://github.com/darcamo/conan-mathgl.git',
'https://github.com/darcamo/conan-vtk.git',
'https://github.com/darcamo/conan-mlpack.git',
'https://github.com/darcamo/conan-hpx.git',
'https://github.com/darcamo/svm-presentation.git',
'https://github.com/darcamo/cookiecutter-revealjs.git',
'https://github.com/darcamo/Python_Workshop_Paracuru.git',
'https://github.com/darcamo/remarkjs_template.git',
'https://github.com/darcamo/Python_Conexao_Fametro.git',
'https://github.com/darcamo/conan-visit_struct.git',
'https://github.com/darcamo/docker_files.git',
'https://github.com/darcamo/conan-imgui-glfw.git',
'https://github.com/darcamo/conan-glfw.git',
'https://github.com/darcamo/conan-nanovg.git',
'https://github.com/darcamo/conan-prettyprint.git',
'https://github.com/darcamo/conan-trase.git',
'https://github.com/darcamo/conan-hwloc.git',
'https://github.com/darcamo/calculator-game-solver.git',
'https://github.com/darcamo/benchmark_linear_algebra_libraries.git',
'https://github.com/darcamo/test_hpx.git',
'https://github.com/darcamo/parallel_and_slurm.git',
'https://github.com/darcamo/gdb_tips.git',
'https://github.com/darcamo/test_multithread_openblas.git',
'https://github.com/darcamo/gdb_armadillo_helpers.git',
'https://github.com/darcamo/conan-cpptqdm.git',
'https://github.com/darcamo/gaussian_process_presentation.git',
'https://github.com/darcamo/conan-pybind11.git',
'https://github.com/darcamo/conan-imgui-plot.git',
'https://github.com/darcamo/conan-tcbrindle-span.git',
'https://github.com/darcamo/gpr_complex.git',
'https://github.com/darcamo/conan-center-index.git',
'https://github.com/darcamo/version_check_hook.git',
'https://github.com/darcamo/cpp-doom.git',
'https://github.com/darcamo/pre-commit-cpp.git',
'https://github.com/darcamo/covid19.git',
'https://github.com/durvalcarvalho/monty_hall_desafio.git',
'https://github.com/durvalcarvalho/Space_Invaders.git',
'https://github.com/atomero/UnGastos.git',
'https://github.com/durvalcarvalho/Pokedex-OOFGA.git',
'https://github.com/durvalcarvalho/pratica-eletronica-digital.git',
'https://github.com/durvalcarvalho/uri-online-judge.git',
'https://github.com/durvalcarvalho/snake_game_terminal.git',
'https://github.com/durvalcarvalho/visao.git',
'https://github.com/pedroeagle/contador_moedas.git',
'https://github.com/durvalcarvalho/contador_moedas.git',
'https://github.com/durvalcarvalho/pong-game.git',
'https://github.com/durvalcarvalho/python-turtle-programs.git',
'https://github.com/durvalcarvalho/competitive_programming.git',
'https://github.com/durvalcarvalho/TEP.git',
'https://github.com/durvalcarvalho/fac-fundamentos-de-arquitetura-de-computadores.git',
'https://github.com/durvalcarvalho/OpenCV-with-Python.git',
'https://github.com/durvalcarvalho/MWebCrawler.git',
'https://github.com/fga-eps-mds/2019.2-Acacia.git',
'https://github.com/MarthaDs/TreinaBolinho.git',
'https://github.com/projeto-de-algoritmos-2019-2/GraphAutoComplete.git',
'https://github.com/projeto-de-algoritmos-2019-2/autocomplete.git',
'https://github.com/projeto-de-algoritmos-2019-2/fast-autocomplete.git',
'https://github.com/projeto-de-algoritmos-2019-2/DictionaryAutoComplete.git',
'https://github.com/durvalcarvalho/sistemas-de-banco-de-dados-1.git',
'https://github.com/projeto-de-algoritmos-2019-2/project-1-lightsout.git',
'https://github.com/durvalcarvalho/graphmdsapi.git',
'https://github.com/durvalcarvalho/project-1-graphs.git',
'https://github.com/projeto-de-algoritmos-2019-2/project-2-betina-currency.git',
'https://github.com/projeto-de-algoritmos-2019-2/project-6-google-plus-plus.git',
'https://github.com/projeto-de-algoritmos/project-1-lightsout-durval_carvalho-victor_moura.git',
'https://github.com/Treina-Bolinho/treinamento-HTML-CSS.git',
'https://github.com/Treina-Bolinho/treinamento-GIT.git',
'https://github.com/Treina-Bolinho/treinamento-metodos-ageis.git',
'https://github.com/Treina-Bolinho/treinamento-python.git',
'https://github.com/durvalcarvalho/Projects.git',
'https://github.com/fga-eps-mds/2019.2-Acacia-Frontend.git',
'https://github.com/durvalcarvalho/build-your-own-x.git',
'https://github.com/projeto-de-algoritmos/Grafos2-DurvalCarvalho_VictorMoura.git',
'https://github.com/durvalcarvalho/App-CV.git',
'https://github.com/durvalcarvalho/awesome-for-beginners.git',
'https://github.com/durvalcarvalho/2019.2-Acacia.git',
'https://github.com/durvalcarvalho/pyhuff.git',
'https://github.com/projeto-de-algoritmos/Trabalho4-DurvalCarvalho_VictorMoura.git',
'https://github.com/projeto-de-algoritmos/project-5-capitalist-adventure.git',
'https://github.com/projeto-de-algoritmos/project-6-google-plus-plus.git',
'https://github.com/durvalcarvalho/ecommerce-with-django.git',
'https://github.com/durvalcarvalho/elearning-cms-django.git',
'https://github.com/durvalcarvalho/design-patterns.git',
'https://github.com/durvalcarvalho/effective_cpp__cpp_primer.git',
'https://github.com/durvalcarvalho/learning-dotNet-CSharp.git',
'https://github.com/durvalcarvalho/learningJavaScript.git',
'https://github.com/durvalcarvalho/learning-web-scraping.git',
'https://github.com/durvalcarvalho/photo-organizer.git'
    ]

    i = 0

    for repo in repos:
            
        try:
            i += 1
            print(str(i) + '/' + str(len(repos)))
            with suppress_stdout():
                run(repo)
        except:
            print("ERRO! Repositório: " + repo)
    