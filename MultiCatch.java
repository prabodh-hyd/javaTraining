  class MultiCatch
  {
   public static void main(String args[])
    {
     try
      {
         int denom =  Integer.parseInt(args[0])  ;
         System.out.println(1000/denom);    
                                                                 // in this if  denom '0' got arthemtic exception.
      }
          catch(ArrayIndexOutOfBoundsException aie)
        {
            System.out.print("\n printStackTrace()  ");
            aie.printStackTrace();
         }
          catch(ArithmeticException ae)
         {
            System.out.println("getMessage() \n " +ae.getMessage());
         }
        catch(Exception a)
         {
           System.out.println("toString() \n "+a.toString());
          }
        }
      }