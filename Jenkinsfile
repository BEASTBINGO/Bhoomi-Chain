
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Check Environment') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'git --version'
            }
        }

        stage('Backend Check') {
            steps {
                dir('backend') {
                    bat 'npm install'
                    bat 'node --check src/server.js'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('BhoomiChain-SonarQube') {
                        bat "\"${scannerHome}\\bin\\sonar-scanner.bat\""
                    }
                }
            }
        }

        stage('Build Citizen Portal') {
            steps {
                dir('citizen-portal') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Government Portal') {
            steps {
                dir('government-portal') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'BhoomiChain pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the stage logs for details.'
        }

        always {
            echo 'BhoomiChain pipeline execution finished.'
        }
    }
}
