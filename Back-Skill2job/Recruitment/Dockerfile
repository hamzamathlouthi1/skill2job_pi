FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml /workspace/pom.xml
COPY Recruitment/pom.xml /workspace/Recruitment/pom.xml
COPY Recruitment/src /workspace/Recruitment/src

WORKDIR /workspace/Recruitment
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/Recruitment/target/*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java","-jar","app.jar"]