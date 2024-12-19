public class MultipleCatchBlock1 
    {  
  static int a[]=new int[5];
    public static void main(String[] args) 
      {  
          
           try
              {    
                 
                System.out.println("Access element three :" + a[3]);   
                 
               }    
               catch(ArithmeticException e)  
                  {  
                   System.out.println("Arithmetic Exception occurs");  
                  }    
                 catch(ArrayIndexOutOfBoundsException e)  
                  {  
                   System.out.println("ArrayIndexOutOfBounds Exception occurs");  
                  }    
                 catch(Exception e)  
                  {  
                   System.out.println("Parent Exception occurs");  
                  }
                  finally {
                    a[5]=30/0;
                  }               
         }  
       }  