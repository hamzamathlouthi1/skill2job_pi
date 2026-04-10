FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml /workspace/pom.xml
COPY GestionSession/pom.xml /workspace/GestionSession/pom.xml
COPY GestionSession/src /workspace/GestionSession/src

WORKDIR /workspace/GestionSession
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/GestionSession/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","app.jar"]