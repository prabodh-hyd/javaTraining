package in.prabodh;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.api.common.AttributeKey;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) {
        System.setProperty("otel.log.level", "debug");

        OtlpHttpSpanExporter spanExporter = OtlpHttpSpanExporter.builder()
                .setEndpoint("https://api.openobserve.ai/api/2rIqjGXiFYs7dAoTzR6a0AbgBaf/v1/traces") // Modified endpoint
                .addHeader("Authorization", "Basic c2lkZGFydGhuYW5kYW4xNEBnbWFpbC5jb206dzFJc1VLU0M5UW5wandYYQ==")// Add organization ID as header
                .addHeader("stream-name", "default")
                .build();

        OtlpHttpMetricExporter metricExporter = OtlpHttpMetricExporter.builder()
                .setEndpoint("https://api.openobserve.ai/api/2rIqjGXiFYs7dAoTzR6a0AbgBaf/v1/metrics") // Modified endpoint
                .addHeader("Authorization", "Basic c2lkZGFydGhuYW5kYW4xNEBnbWFpbC5jb206dzFJc1VLU0M5UW5wandYYQ==")// Add organization ID as header
                .addHeader("stream-name", "default")
                .build();

        Resource resource = Resource.getDefault()
                .merge(Resource.create(Attributes.of(
                        AttributeKey.stringKey("service.name"), "telemetry-demo-service",
                        AttributeKey.stringKey("service.version"), "1.0.0",
                        AttributeKey.stringKey("service.instance.id"), "instance-" + System.currentTimeMillis(),
                        AttributeKey.stringKey("deployment.environment"), "development",
                        AttributeKey.stringKey("host.name"), System.getProperty("user.name")
                )));

        // Set up TracerProvider with modified BatchSpanProcessor
        BatchSpanProcessor batchSpanProcessor = BatchSpanProcessor.builder(spanExporter)
                .setScheduleDelay(100, TimeUnit.MILLISECONDS)
                .setExporterTimeout(30, TimeUnit.SECONDS)
                .setMaxQueueSize(2048)
                .setMaxExportBatchSize(512)
                .build();

        SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
                .setResource(resource)
                .addSpanProcessor(batchSpanProcessor)
                .build();

        PeriodicMetricReader periodicMetricReader = PeriodicMetricReader.builder(metricExporter)
                .setInterval(Duration.ofSeconds(15))
                .build();

        SdkMeterProvider meterProvider = SdkMeterProvider.builder()
                .setResource(resource)
                .registerMetricReader(periodicMetricReader)
                .build();

        OpenTelemetrySdk openTelemetry = OpenTelemetrySdk.builder()
                .setTracerProvider(tracerProvider)
                .setMeterProvider(meterProvider)
                .build();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down OpenTelemetry SDK...");
            try {
                tracerProvider.forceFlush();
                meterProvider.forceFlush();
                // Allow time for final export
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                System.err.println("Error during shutdown: " + e.getMessage());
            } finally {
                openTelemetry.close();
            }
        }));

        Tracer tracer = openTelemetry.getTracer("example-tracer", "1.0.0");
        Meter meter = openTelemetry.getMeter("example-meter");

        LongCounter requestCounter = meter.counterBuilder("telemetry_requests_sent")
                .setDescription("Counts the number of telemetry requests sent")
                .setUnit("1")
                .build();

        for (int i = 0; i < 5; i++) {
            Span span = tracer.spanBuilder("example-span-" + i)
                    .setAttribute("iteration", i)
                    .setAttribute("timestamp", System.currentTimeMillis())
                    .setAttribute("user", "SomanathNemilidinne")
                    .setAttribute("test_run_id", "test-" + System.currentTimeMillis())
                    .startSpan();

            try {
                span.addEvent("Processing iteration " + i);
                Thread.sleep(100);
                requestCounter.add(1, Attributes.of(
                        AttributeKey.stringKey("operation"), "test-operation",
                        AttributeKey.longKey("iteration"), (long) i
                ));
                span.addEvent("Completed iteration " + i);
            } catch (InterruptedException e) {
                span.recordException(e);
                System.err.println("Error during processing: " + e.getMessage());
            } finally {
                span.end();
            }
        }

        System.out.println("OTLP Exporter configured, waiting for export...");

        try {
            // Wait longer for export
            Thread.sleep(30000);  // Wait 30 seconds, just giving it maximum time as we are sending a lot of attributes.
        } catch (InterruptedException e) {
            System.err.println("Sleep interrupted: " + e.getMessage());
        }

        System.out.println("Program completed!");
    }
}