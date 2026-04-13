FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml /workspace/pom.xml
COPY GestionFormation/pom.xml /workspace/GestionFormation/pom.xml
COPY GestionFormation/src /workspace/GestionFormation/src

WORKDIR /workspace/GestionFormation
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/GestionFormation/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","app.jar"]