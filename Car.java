package org.example;

public class Car {
    private String color;
    private int size;
    private double weight;


    public static void start(){
        System.out.println("Press the car key");
    }
    public static void accelerator(){
        System.out.println("press the accelerator");
    }


    public void setColour(String color){
        this.color = color;
    }
    public void setSize(int size){
        this.size = size;
    }
    public void setWeight(double weight){
        this.weight = weight;
    }


    public void displayCar(){
        System.out.println("Color of the car is :"+ color);
        System.out.println("weight of the car is :" +weight);
        System.out.println("size of the car is :"+ size);
    }
}