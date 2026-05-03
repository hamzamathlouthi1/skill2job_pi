FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY GestionExams/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
