package in.prabodh;

import io.prometheus.client.Gauge;
import io.prometheus.client.exporter.HTTPServer;

import java.io.IOException;
import java.util.Random;

public class example {
    public static void main(String[] args) throws IOException {
        // Create a Prometheus Gauge metric for CPU clock speed
        Gauge cpuClockSpeedGauge = new Gauge.Builder()
                .name("cpu_clock_speed_mhz")
                .help("Simulated CPU clock speed in MHz")
                .labelNames("core", "status")
                .register();

        // Create a simple HTTPServer to expose metrics on port 8080
        HTTPServer server = new HTTPServer(8080);  // Exposing on localhost:8080

        Random random = new Random();
        for (int j = 0; j < 900; j++) {
            // Simulate CPU clock speed data every second for 10 seconds
            for (int i = 0; i < 10; i++) {
                try {
                    // Simulate a random CPU clock speed (in MHz) between 1000 and 5000 MHz
                    double clockSpeed = 1000 + (5000 - 1000) * random.nextDouble();

                    // Simulate two CPU cores with varying clock speeds
                    cpuClockSpeedGauge.labels("core_" + (i % 2 + 1), "active").set(clockSpeed);  // Random clock speed for core 1 and 2
                    System.out.printf("Simulated CPU clock speed for core_%d: %.2f MHz%n", (i % 2 + 1), clockSpeed);

                    // Sleep for a second to simulate real-time data collection
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    System.err.println("Error during processing: " + e.getMessage());
                }
            }
        }

        System.out.println("Prometheus metrics exposed on localhost:8080/metrics");

        // Keep the server running so that the metrics get exported
        try {
            Thread.sleep(8000);  // Run for 8 seconds(Testing just enough required time).
        } catch (InterruptedException e) {
            System.err.println("Sleep interrupted: " + e.getMessage());
        }

        // Shut down the server(I don't know just doing it)
        server.stop();
        System.out.println("Prometheus exporter stopped!");
    }
}
