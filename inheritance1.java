import java.util.*;
class Super
{
    int x;
    Super(int x)
    {
        this.x =x;
    }
    void display()
    {
        System.out.println("Super has "+ x);
        System.out.println("shiva");
    }
}
class sub extends Super
{
    int y;
    sub(int x, int y)
    {
        super(x);
        this.y=y;
    }
    void display()
    {
        super.display();
        System.out.println("Super X "+(x+1));
        System.out.println("sub y "+y);
        System.out.println("Avika");
    }
}
public class inheritance1 
{
    public static void main(String Args[])
    {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        sub obj = new sub(a,b);
        obj.display();
    }
}
