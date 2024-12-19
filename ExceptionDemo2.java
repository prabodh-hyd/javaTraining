import java.util.Scanner;
class ExceptionDemo2
   {
     public static void main (String args[])
      {
     
      Scanner sc=new Scanner(System.in);

      System.out.println("enter the x value = ");
      int x =sc.nextInt();  
      System.out.println("input integer is..:"+x);  

      System.out.println("enter the y value = ");
      int y =sc.nextInt();  
      System.out.println("input integer is..:"+y);
        
     try
      {
       int z=x/y;
       System.out.println("The result is " +z);
      }
     catch(Exception e)
       {
        System.out.println("y should not be 0");
       }
        System.out.println("The program continued");
      }
    }