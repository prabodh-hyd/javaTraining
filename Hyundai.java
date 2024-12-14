package org.example;

public class Hyundai extends Car{
    public static void main(String[] args) {
        start();
        accelerator();
        brakes();
    }
    public static void brakes(){
        System.out.println("Press the breaks");
    }

    public static void start(){
        String status = "ON";
        System.out.println("Turn the ke y " + status);
    }
}
