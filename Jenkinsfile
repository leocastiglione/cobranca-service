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
                        credentialsId: 'INFISICAL_SERVICE_TOKEN',
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
                            --projectId=cbcc8789-3cf2-440c-8e90-8dfff9872bff \
                            --token="$INFISICAL_SERVICE_TOKEN" \
                            --format=dotenv > .env
                        chmod 600 .env

                        DB_USER=$(grep '^DB_USUARIO=' .env | cut -d= -f2- | sed -e "s/^['\\"]//" -e "s/['\\"]$//")
                        DB_PASS=$(grep '^DB_USUARIO_SENHA=' .env | cut -d= -f2- | sed -e "s/^['\\"]//" -e "s/['\\"]$//")
                        DB_NAME=$(grep '^COBRANCA=' .env | cut -d= -f2- | sed -e "s/^['\\"]//" -e "s/['\\"]$//")
                        DB_HOST=edumysql.acesso.rj.senac.br
                        DB_PORT=3306

                        USER_ENC=$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$DB_USER")
                        PASS_ENC=$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$DB_PASS")

                        {
                            echo "DB_HOST=${DB_HOST}"
                            echo "DB_PORT=${DB_PORT}"
                            echo "DATABASE_URL=mysql://${USER_ENC}:${PASS_ENC}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
                        } >> .env

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
