pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        APP_NAME = 'cobranca-service'
    }

    stages {

        stage('Checkout GitHub') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/leocastiglione/cobranca-service.git'
                    ]]
                ])
            }
        }

        stage('Fetch Secrets - Infisical') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'tokenleonardoaluguelcarro',
                        variable: 'INFISICAL_SERVICE_TOKEN'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu
                        umask 077
                        rm -f .env

                        npx -y @infisical/cli export \
                            --env="dev" \
                            --path="/cobranca-service" \                
                            --token="$INFISICAL_SERVICE_TOKEN" \
                            > .env                        
                        
                        test -s .env || { echo "ERRO: .env vazio."; exit 1; }

                        echo "Variáveis carregadas:"
                        cut -d= -f1 .env
                    '''
                }
            }
        }

        stage('Validar Docker Compose') {
            steps {
                sh '''
                    set -eu
                    docker compose config --quiet
                    echo "Docker Compose validado."
                '''
            }
        }

        stage('Construir Imagem Docker') {
            steps {
                sh '''
                    set -eu
                    docker compose build
                    echo "Imagem Docker construída."
                '''
            }
        }

        stage('Deploy Docker') {
            steps {
                sh '''
                    set -eu
                    docker compose up -d --no-build --force-recreate
                    echo "Deploy executado."
                '''
            }
        }

        stage('Verificar Container') {
            steps {
                sh '''
                    set -eu

                    echo "Verificando container..."
                    sleep 10

                    RUNNING=$(docker inspect --format '{{.State.Running}}' "$APP_NAME")

                    if [ "$RUNNING" != "true" ]; then
                        echo "ERRO: Container não está rodando."
                        docker logs --tail=80 "$APP_NAME" || true
                        exit 1
                    fi

                    echo "Container em execução."
                    docker compose ps

                    echo "Versão do Node.js no container:"
                    docker exec "$APP_NAME" node -v
                '''
            }
        }
    }

    post {

        success {
            echo '''
            ====================================
             Cobranca Service Executado com sucesso
             DEPLOY EXECUTADO COM SUCESSO
             PORTA: 7544
            ====================================
            '''
        }

        failure {
            echo '''
            ====================================
             Cobranca Service - Falha na execução do pipeline
             FALHA NA EXECUÇÃO DO PIPELINE
            ====================================
            '''
        }

        // always {
        //     sh '''
        //         set +x
        //         rm -f .env
        //     '''
        // }
    }
}
