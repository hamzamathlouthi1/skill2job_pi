# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy parent pom and install it first
COPY pom.xml ./pom.xml
RUN mvn install -N -DskipTests

# Copy Recruitment module
COPY Recruitment/pom.xml Recruitment/pom.xml
COPY Recruitment/src Recruitment/src

# Build Recruitment
RUN mvn clean package -DskipTests -pl Recruitment

# Runtime stage
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/Recruitment/target/*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "app.jar"]
