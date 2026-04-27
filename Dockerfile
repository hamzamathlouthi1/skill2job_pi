# ========== STAGE 1 : Build ==========
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# ========== STAGE 2 : Runtime ==========
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Variables d'environnement MySQL
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_NAME=user
ENV DB_USERNAME=root
ENV DB_PASSWORD=

# JWT
ENV JWT_SECRET=VotreSecretKeyTresLongueEtSecurisee1234567890ABCDEFabcdefghijklmnop
ENV JWT_EXPIRATION=86400000

EXPOSE 8089

ENTRYPOINT ["java", "-jar", "app.jar"]
