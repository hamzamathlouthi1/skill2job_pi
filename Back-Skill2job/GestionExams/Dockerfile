FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml /workspace/pom.xml
COPY GestionExams/pom.xml /workspace/GestionExams/pom.xml
COPY GestionExams/src /workspace/GestionExams/src

WORKDIR /workspace/GestionExams
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/GestionExams/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","app.jar"]