environment {
    IMAGE_NAME = "souhakhelifi/gestionformation"
    IMAGE_TAG  = "latest"
}

stage('Build Docker Image') {
    steps {
        sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
    }
}

stage('Push to Docker Hub') {
    steps {
        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-credentials',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {
            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
            sh 'docker push ${IMAGE_NAME}:${IMAGE_TAG}'
        }
    }
}
