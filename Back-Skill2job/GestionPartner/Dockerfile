FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml /workspace/pom.xml
COPY GestionPartner/pom.xml /workspace/GestionPartner/pom.xml
COPY GestionPartner/src /workspace/GestionPartner/src

WORKDIR /workspace/GestionPartner
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/GestionPartner/target/*.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java","-jar","app.jar"]