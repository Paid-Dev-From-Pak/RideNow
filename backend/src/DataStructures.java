import java.util.*;

public class DataStructures {

    // ==========================================
    // 1. TRIE (Prefix Tree) - Map Search Suggestion
    // ==========================================
    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord = false;
    }

    static class LocationTrie {
        private TrieNode root = new TrieNode();

        public void insert(String word) {
            TrieNode current = root;
            for (char ch : word.toLowerCase().toCharArray()) {
                current.children.putIfAbsent(ch, new TrieNode());
                current = current.children.get(ch);
            }
            current.isEndOfWord = true;
        }

        public boolean search(String word) {
            TrieNode current = root;
            for (char ch : word.toLowerCase().toCharArray()) {
                if (!current.children.containsKey(ch)) return false;
                current = current.children.get(ch);
            }
            return current.isEndOfWord;
        }
    }

    // ==========================================
    // 2. STACK - Ride Status History (Undo/Cancel)
    // ==========================================
    static class RideStatusTracker {
        private Stack<String> statusHistory = new Stack<>();

        public void updateStatus(String status) {
            statusHistory.push(status);
        }

        public String getCurrentStatus() {
            return statusHistory.isEmpty() ? "No Ride" : statusHistory.peek();
        }

        public void cancelRide() {
            if (!statusHistory.isEmpty()) {
                statusHistory.pop();
            }
        }
    }

    // ==========================================
    // 3. PRIORITY QUEUE - Nearest Driver Matching
    // ==========================================
    static class Driver implements Comparable<Driver> {
        String name;
        double distanceInKm;

        public Driver(String name, double distanceInKm) {
            this.name = name;
            this.distanceInKm = distanceInKm;
        }

        @Override
        public int compareTo(Driver other) {
            return Double.compare(this.distanceInKm, other.distanceInKm);
        }
    }

    // ==========================================
    // 4. HASHMAP - Fast User/Cache Lookup
    // ==========================================
    static class RideCache {
        private Map<String, String> activeRides = new HashMap<>();

        public void addRide(String rideId, String passengerName) {
            activeRides.put(rideId, passengerName);
        }

        public String getPassenger(String rideId) {
            return activeRides.getOrDefault(rideId, "Not Found");
        }
    }

    // ==========================================
    // 5. GRAPH (Dijkstra Algorithm) - Shortest Route
    // ==========================================
    static class Graph {
        private Map<String, Map<String, Integer>> adjList = new HashMap<>();

        public void addEdge(String source, String destination, int distance) {
            adjList.putIfAbsent(source, new HashMap<>());
            adjList.putIfAbsent(destination, new HashMap<>());
            adjList.get(source).put(destination, distance);
            adjList.get(destination).put(source, distance); 
        }

        public void findShortestPath(String start, String end) {
            Map<String, Integer> distances = new HashMap<>();
            PriorityQueue<String> pq = new PriorityQueue<>(Comparator.comparingInt(distances::get));

            for (String node : adjList.keySet()) distances.put(node, Integer.MAX_VALUE);
            distances.put(start, 0);
            pq.add(start);

            while (!pq.isEmpty()) {
                String current = pq.poll();
                if (current.equals(end)) break;

                for (Map.Entry<String, Integer> neighbor : adjList.get(current).entrySet()) {
                    int newDist = distances.get(current) + neighbor.getValue();
                    if (newDist < distances.get(neighbor.getKey())) {
                        distances.put(neighbor.getKey(), newDist);
                        pq.add(neighbor.getKey());
                    }
                }
            }
            System.out.println("Shortest Distance from " + start + " to " + end + " is: " + distances.get(end) + " km");
        }
    }
}