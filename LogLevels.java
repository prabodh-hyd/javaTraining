public class LogLevels {
    public static String message(String logLine) {
        return logLine.split(": ", 2)[1].trim();
    }

    public static String logLevel(String logLine) {
        String[] parts = logLine.split(": ", 2);
        String bracket = parts[0];
        return bracket.substring(1, bracket.length() - 1).toLowerCase();
    }

    public static String reformat(String logLine) {
        String message = message(logLine);
        String level = logLevel(logLine);
        return message + " (" + level + ")";
    }
}
