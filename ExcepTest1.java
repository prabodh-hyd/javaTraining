// File Name : ExcepTest.java
import java.io.*;
public class ExcepTest1
   {

   public static void main(String args[])
     {
      try
        {
         int a[] = new int[2];
         System.out.println("\n Access element three :" + a[3]);
        }
         catch(ArrayIndexOutOfBoundsException aie)
         {
         System.out.println("\n Exception thrown  :\n" + aie);
         }
         System.out.println("\n Out of the block");
       }
    }
