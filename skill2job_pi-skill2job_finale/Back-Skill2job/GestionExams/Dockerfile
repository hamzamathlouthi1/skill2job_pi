# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy parent pom first (for dependency resolution)
COPY pom.xml .

# Copy only the service you need
COPY GestionExams GestionExams/

# If your service depends on other modules, uncomment below:
# COPY common-utils common-utils/
# COPY GestionUser GestionUser/

# Build only exams-service
RUN mvn clean package -DskipTests -pl GestionExams -am

# Runtime stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the built jar
COPY --from=builder /app/GestionExams/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
