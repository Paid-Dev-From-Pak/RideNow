FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY . .
RUN javac src/Main.java src/DataStructures.java
CMD ["java", "-cp", "src", "Main"]