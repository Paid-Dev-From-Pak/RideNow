import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) throws IOException {
        
        // ==========================================
        // 1. DATA STRUCTURES TESTING
        // ==========================================
        System.out.println("--- Testing 5 Data Structures ---");

        DataStructures.LocationTrie trie = new DataStructures.LocationTrie();
        trie.insert("Gulshan");
        trie.insert("Gulberg");
        System.out.println("1. Trie Search 'Gulshan': " + trie.search("Gulshan"));

        DataStructures.RideStatusTracker tracker = new DataStructures.RideStatusTracker();
        tracker.updateStatus("Requested");
        tracker.updateStatus("Accepted");
        System.out.println("2. Current Ride Status (Stack): " + tracker.getCurrentStatus());

        PriorityQueue<DataStructures.Driver> driverQueue = new PriorityQueue<>();
        driverQueue.add(new DataStructures.Driver("Ali", 2.5));
        driverQueue.add(new DataStructures.Driver("Hamza", 0.8));
        System.out.println("3. Nearest Driver (Priority Queue): " + driverQueue.peek().name);

        DataStructures.RideCache cache = new DataStructures.RideCache();
        cache.addRide("R101", "Zain");
        System.out.println("4. Passenger for Ride R101 (HashMap): " + cache.getPassenger("R101"));

        DataStructures.Graph cityGraph = new DataStructures.Graph();
        cityGraph.addEdge("North Nazimabad", "Gulshan", 6);
        cityGraph.addEdge("Gulshan", "Saddar", 10);
        System.out.println("5. Dijkstra Shortest Path:");
        cityGraph.findShortestPath("North Nazimabad", "Saddar");

        System.out.println("---------------------------------\n");


        // ==========================================
        // 2. SERVER & API LOGIC
        // ==========================================
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Test API
        server.createContext("/api/test", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                String response = "RideNow Java Backend is Running Successfully!";
                exchange.sendResponseHeaders(200, response.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        });

        // NAYA: Java Backend Fare Calculator
        server.createContext("/api/fare", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                // CORS Allow karein taake browser block na kare
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                
                String query = exchange.getRequestURI().getQuery();
                double distance = 0;
                
                // URL se distance nikaalein (jaise: ?distance=6.5)
                if (query != null && query.contains("distance=")) {
                    String distStr = query.split("distance=")[1].split("&")[0];
                    try {
                        distance = Double.parseDouble(distStr);
                    } catch (Exception e) {
                        distance = 0;
                    }
                }

                // JAVA MEIN FARE CALCULATION (Base 60 + 30/km)
                int baseFare = 60;
                int perKm = 30;
                int totalFare = (int) Math.round(baseFare + (distance * perKm));

                String response = "{\"fare\": " + totalFare + ", \"distance\": " + distance + "}";
                
                exchange.sendResponseHeaders(200, response.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        });

        server.setExecutor(null); 
        server.start();
        
        System.out.println("========================================");
        System.out.println("SUCCESS: Java Server started on port 8080");
        System.out.println("========================================");
    }
}