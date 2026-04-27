# ========== STAGE 1 : Build ==========
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copier d'abord pom.xml pour profiter du cache Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copier le reste du code source
COPY src ./src

# Builder le JAR sans les tests
RUN mvn clean package -DskipTests

# ========== STAGE 2 : Runtime ==========
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copier le JAR depuis le stage build
COPY --from=build /app/target/*.jar app.jar

# Variables d'environnement pour la base de données
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_NAME=gestionformation
ENV DB_USERNAME=root
ENV DB_PASSWORD=root

EXPOSE 8089

ENTRYPOINT ["java", "-jar", "app.jar"]
