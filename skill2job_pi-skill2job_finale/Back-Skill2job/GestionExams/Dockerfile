# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy parent pom
COPY pom.xml .

# Copy GestionExams module
COPY GestionExams/pom.xml GestionExams/pom.xml
COPY GestionExams/src GestionExams/src

# Build only GestionExams module
RUN mvn clean package -pl GestionExams -am -DskipTests -q

# Stage 2: Run
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=builder /app/GestionExams/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
