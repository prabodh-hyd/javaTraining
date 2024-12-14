package org.example;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class fileHandling {
    public static void main(String[] args) {
        try {
            FileInputStream fis = new FileInputStream("C:/Users/JRS/Desktop/notes/ReadMe file for swagger and passport.txt");
            int s = fis.read();
            System.out.println((char) s);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
