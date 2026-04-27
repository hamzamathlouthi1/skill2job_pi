pipeline {
    agent any
    environment {
        DOCKERHUB_IMAGE = 'souhakhelifi/gestionformation'
        SONAR_PROJECT   = 'gestionformation-backend'
    }
    tools {
        maven 'Maven'
        jdk   'JDK17'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/hamzamathlouthi1/skill2job_pi.git',
                    credentialsId: 'github-credentials'
            }
        }
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
        stage('Unit Tests') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        stage('Code Quality — SonarQube') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            mvn sonar:sonar \
                              -Dsonar.projectKey=${SONAR_PROJECT} \
                              -Dsonar.host.url=https://sonarcloud.io \
                              -Dsonar.login=${SONAR_TOKEN}
                        '''
                    }
                }
            }
        }
        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        docker build -t ${DOCKERHUB_IMAGE}:${BUILD_NUMBER} .
                        docker tag  ${DOCKERHUB_IMAGE}:${BUILD_NUMBER} ${DOCKERHUB_IMAGE}:latest
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push ${DOCKERHUB_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKERHUB_IMAGE}:latest
                    '''
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline GestionFormation completed successfully.'
        }
        failure {
            echo 'Pipeline GestionFormation failed — check the logs above.'
        }
        always {
            cleanWs()
        }
    }
}
