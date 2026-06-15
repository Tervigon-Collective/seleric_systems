pipeline {
    agent any

    environment {
        APP_DIR            = '/opt/seleric/seleric_systems'
        GIT_URL            = 'https://github.com/Tervigon-Collective/seleric_systems.git'
        GIT_CREDENTIALS_ID = 'github-app-tervigon'
        ORCHESTRATOR_PORT  = '8000'
        WEB_PORT           = '3001'
        MCP_SHOPIFY_PORT   = '3101'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout / Update code') {
            steps {
                sh """
                    set -e
                    echo "=== Ensuring app directory exists ==="
                    mkdir -p "${APP_DIR}"
                """

                git branch: 'main',
                    credentialsId: "${GIT_CREDENTIALS_ID}",
                    url: "${GIT_URL}"

                sh """
                    set -e
                    echo "=== Sync workspace -> ${APP_DIR} (preserve server-side env + runtime data) ==="
                    rsync -a --delete --no-owner --no-group --no-times \\
                      --exclude='.env' \\
                      --exclude='.env.local' \\
                      --exclude='.git' \\
                      --exclude='node_modules/' \\
                      --exclude='**/.next/' \\
                      --exclude='**/__pycache__/' \\
                      --exclude='**/.pytest_cache/' \\
                      --exclude='.cursor/' \\
                      "${env.WORKSPACE}/" "${APP_DIR}/"

                    echo "=== .env present under APP_DIR? ==="
                    test -f "${APP_DIR}/.env" && echo "OK: .env exists" || { echo "FAIL: create ${APP_DIR}/.env on the server"; exit 1; }
                """
            }
        }

        stage('Build & Deploy with Docker Compose') {
            steps {
                sh """
                    set -e
                    echo "=== Deploying from ${APP_DIR} ==="
                    cd "${APP_DIR}"

                    docker --version
                    docker compose version

                    echo "=== Building & restarting stack ==="
                    docker compose up -d --build

                    echo "=== Running containers ==="
                    docker compose ps
                """
            }
        }

        stage('Health Check') {
            steps {
                sh """
                    set -e
                    echo "=== Health check orchestrator :${ORCHESTRATOR_PORT} ==="
                    ORCH_OK=false
                    for i in \$(seq 1 24); do
                        if curl -fsS "http://127.0.0.1:${ORCHESTRATOR_PORT}/health" >/dev/null; then
                            echo "OK: orchestrator healthy on attempt \$i"
                            ORCH_OK=true
                            break
                        fi
                        echo "Orchestrator attempt \$i failed, retrying in 5s..."
                        sleep 5
                    done
                    if [ "\$ORCH_OK" != "true" ]; then
                        cd "${APP_DIR}"
                        docker compose logs --tail=100 orchestrator || true
                        exit 1
                    fi

                    echo "=== Health check web :${WEB_PORT} ==="
                    WEB_OK=false
                    for i in \$(seq 1 24); do
                        HTTP_CODE=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${WEB_PORT}/" || echo "000")
                        if [ "\$HTTP_CODE" = "200" ] || [ "\$HTTP_CODE" = "307" ] || [ "\$HTTP_CODE" = "308" ]; then
                            echo "OK: web responding (HTTP \$HTTP_CODE) on attempt \$i"
                            WEB_OK=true
                            break
                        fi
                        echo "Web attempt \$i got HTTP \$HTTP_CODE, retrying in 5s..."
                        sleep 5
                    done
                    if [ "\$WEB_OK" != "true" ]; then
                        cd "${APP_DIR}"
                        docker compose logs --tail=100 web || true
                        exit 1
                    fi

                    echo "=== Health check mcp-shopify :${MCP_SHOPIFY_PORT} ==="
                    curl -fsS "http://127.0.0.1:${MCP_SHOPIFY_PORT}/health"
                    echo ""
                    echo "=== Seleric Systems is live ==="
                    echo "  Web:          http://127.0.0.1:${WEB_PORT}  (public: https://multiagent.seleric.com)"
                    echo "  Orchestrator: http://127.0.0.1:${ORCHESTRATOR_PORT}"
                """
            }
        }
    }

    post {
        success {
            echo 'Deploy SUCCESS for seleric_systems'
        }
        failure {
            echo 'Deploy FAILED for seleric_systems. Check console output.'
            sh """
                cd "${APP_DIR}" 2>/dev/null || true
                docker compose ps || true
                docker compose logs --tail=100 || true
            """
        }
    }
}
