package in.prabodh;

import io.prometheus.client.exporter.HTTPServer;
import io.prometheus.client.Counter;

import java.io.IOException;
import java.time.Duration;

public class Main {
    public static void main(String[] args) throws IOException {
        // Prometheus Counter
        Counter requestCounter = new Counter.Builder()
                .name("telemetry_requests_sent")
                .help("Counts the number of telemetry requests sent")
                .labelNames("operation", "iteration")
                .register();

        // Create a simple HTTPServer to expose metrics
        HTTPServer server = new HTTPServer(8080);  // Exposing on localhost:8080

        // Simulate metric increments
        for (int i = 0; i < 500; i++) {
            try {
                Thread.sleep(100);
                requestCounter.labels("test-operation", String.valueOf(i)).inc();  // Incrementing the metric
            } catch (InterruptedException e) {
                System.err.println("Error during processing: " + e.getMessage());
            }
        }

        System.out.println("Prometheus metrics exposed on localhost:8080/metrics");

        // Keep the server running to expose the metrics
        try {
            Thread.sleep(10000);  // Run for 10 seconds, adjust as needed
        } catch (InterruptedException e) {
            System.err.println("Sleep interrupted: " + e.getMessage());
        }

        // Shut down the server
        server.stop();
        System.out.println("Prometheus exporter stopped!");
    }
}
