package in.prabodh;

public class Main {
    public static void main(String[] args) {
        Printing<Double> printer = new Printing<>(352.14);
        printer.printInteger();

        Printing<Integer> integerPrinting = new Printing<>(352);
        integerPrinting.printInteger();

        Printing<String> stringPrinting = new Printing<>("Testing");
        stringPrinting.printInteger();
    }
}