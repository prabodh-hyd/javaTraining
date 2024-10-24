import java.util.*;
interface Demo
{
    public void show(int i,int j);
    public void result(int i,int j);
}
class Interdemo implements Demo
{
    public void show(int i,int j)
    {
        System.out.println("the numbers are :"+i+" "+j);
        System.out.println("the sum : "+(i+j));
    }
    public void result(int i,int j)
    {
        System.out.println("the numbers are :"+i+" "+j);
        System.out.println("the sum : "+(i+j));
    }
}
public class Interface1 
{
    public static void main(String Args[])
    {
        Demo obj = new Interdemo();
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        obj.show(a, b);
        obj.result(a, b);
    }   
}
