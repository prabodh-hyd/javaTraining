import java.io.*; 
import java.lang.*;  
 class File
  {
    public static void main(String arg[])
     {
      try
       {
        File f = new File("File.txt");
         int i,j;
         i=5;
         int k=j/i;
         f.close();
        }
         catch(ArithmeticException ae)
         {
          System.out.println("Arithmetic ExceptionOccured");
         }
          catch(FileNotFoundException fe)
          {
          System.out.println("File not found exception");
         }
        finally
      {
        System.out.print("FInally always occurs");
      }
       }
     }
       