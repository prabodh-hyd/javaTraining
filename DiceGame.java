package org.example;
import java.util.Scanner;
public class DiceGame {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter the number");
        int number = sc.nextInt();
        if (number<6){
            System.out.println("You won the game");
        }
        else{
            System.out.println("You lost the game");
        }
    }
}
