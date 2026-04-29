# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy parent pom
COPY pom.xml .

# Copy ALL modules (Maven needs them for dependency resolution)
COPY Eureka_project Eureka_project/
COPY api_gateway_pi api_gateway_pi/
COPY GestionExams GestionExams/
COPY GestionSession GestionSession/
COPY GestionFormation GestionFormation/
COPY Recruitment Recruitment/
COPY GestionPartner GestionPartner/
COPY GestionUser GestionUser/

# Build ONLY the exams-service
RUN mvn clean package -DskipTests -pl GestionExams -am

# Runtime stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy only your service's jar
COPY --from=builder /app/GestionExams/target/*.jar app.jar

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
