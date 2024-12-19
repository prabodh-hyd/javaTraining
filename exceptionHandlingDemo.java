import java.io.*;
import java.util.Scanner;

class ExceptionSubClass {
    void arrayIndexDemo() {
        try {
            int[] a = new int[2];
            System.out.println("Access element three: " + a[3]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Exception thrown: " + e);
        }
        System.out.println("Out of the block\n");
    }

    void arithmeticDemo() {
        try {
            int x = 10, y = 0;
            int z = x / y;
            System.out.println("The result is: " + z);
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero\n");
        }
        System.out.println("Program continued\n");
    }

    void scannerDemo() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter the x value: ");
        int x = sc.nextInt();
        System.out.print("Enter the y value: ");
        int y = sc.nextInt();

        try {
            int z = x / y;
            System.out.println("The result is: " + z);
        } catch (ArithmeticException e) {
            System.out.println("y should not be 0");
        }
        System.out.println("Program continued\n");
    }

    void multipleCatchDemo() {
        try {
            int[] a = new int[5];
            a[5] = 30 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic Exception occurs");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("ArrayIndexOutOfBounds Exception occurs");
        } catch (Exception e) {
            System.out.println("Parent Exception occurs");
        }
        System.out.println("Rest of the code\n");
    }

    void finallyDemo() {
        try {
            int data = 25 / 0;
            System.out.println(data);
        } catch (ArithmeticException e) {
            System.out.println(e);
        } finally {
            System.out.println("Finally block is always executed");
        }
        System.out.println("Rest of the code...\n");
    }

    void throwExample() {
        try {
            throw new StringIndexOutOfBoundsException("Hello Manoj & Siva");
        } catch (StringIndexOutOfBoundsException e) {
            System.out.println("Exception caught: " + e);
        }
    }

    void throwsExample() {
        try {
            myOwnException();
        } catch (ClassNotFoundException e) {
            System.out.println("myOwnException caught: " + e);
        }
    }

    static void myOwnException() throws ClassNotFoundException {
        throw new ClassNotFoundException("JAI SRI RAM");
    }

    void fileHandlingDemo() {
        try {
            File file = new File("File.txt");
            int i = 5, j = 0;
            int k = i / j;
        } catch (ArithmeticException ae) {
            System.out.println("Arithmetic Exception Occurred");
        } catch (FileNotFoundException fe) {
            System.out.println("File Not Found Exception");
        } finally {
            System.out.println("Finally always occurs\n");
        }
    }

    void ioHandlingDemo() {
        try {
            System.out.println("Enter a character: ");
            int i = System.in.read();
            System.out.println("Character entered: " + (char) i);
            System.out.println("ASCII value: " + i);
        } catch (IOException e) {
            System.out.println("Catch block executed: " + e);
        } finally {
            System.out.println("Finally always occurs\n");
        }
    }
}

// Main Class to Call Exception Handling Subclass
public class ExceptionHandlingDemo {
    public static void main(String[] args) {
        ExceptionSubClass demo = new ExceptionSubClass();
        //demo.arrayIndexDemo();
        demo.arithmeticDemo();
        //demo.scannerDemo();
        //demo.multipleCatchDemo();
        //demo.finallyDemo();
        //demo.throwExample();
        //demo.throwsExample();
        //demo.fileHandlingDemo();
        //demo.ioHandlingDemo();
    }
}
