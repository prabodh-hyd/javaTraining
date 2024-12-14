package org.example;

public class ExceptionEx {
    public static void main(String[] args) {
        handleArithematicExeption(200);
        handleNullPointerExeption(null);
    }
    private static void handleArithematicExeption(int number){
        try {
            int a = number/0;
        }
        catch (ArithmeticException exception){
            exception.printStackTrace();
        }
    }
    private static void handleNullPointerExeption(String s){
        try{
            System.out.println(s.length());
        }
        catch (NullPointerException e){
            e.printStackTrace();
        }
    }
}
