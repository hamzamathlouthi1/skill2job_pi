FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY . .
# ❌ Avant (cherche un sous-module qui n'existe pas dans ce contexte)
# RUN mvn clean package -DskipTests -pl GestionPartner -am

# ✅  (on est déjà dans GestionPartner/)
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/GestionPartner-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
