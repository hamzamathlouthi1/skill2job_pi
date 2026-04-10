FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml /workspace/pom.xml
COPY Eureka_project/pom.xml /workspace/Eureka_project/pom.xml
COPY Eureka_project/src /workspace/Eureka_project/src

WORKDIR /workspace/Eureka_project
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/Eureka_project/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","app.jar"]