FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests -pl GestionPartner -am

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/GestionPartner/target/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
