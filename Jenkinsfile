pipeline {
    agent any
    environment {
        DOCKERHUB_IMAGE = 'souhakhelifi/gestionformation'
    }
    tools {
        maven 'Maven'
        jdk   'JDK17'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
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
