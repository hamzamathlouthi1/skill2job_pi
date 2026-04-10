FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml /workspace/pom.xml
COPY api_gateway_pi/pom.xml /workspace/api_gateway_pi/pom.xml
COPY api_gateway_pi/src /workspace/api_gateway_pi/src

WORKDIR /workspace/api_gateway_pi
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/api_gateway_pi/target/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java","-jar","app.jar"]