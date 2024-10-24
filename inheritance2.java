import java.util.*;
class Room
{
    int lenght;
    int breadth;
    Room(int x, int y)
    {
        lenght=x;
        breadth=y;
    }
    int area()
    {
        return (lenght*breadth);
    }
}
class Bedroom extends Room
{
    int height;
    Bedroom(int x,int y,int z)
    {
        super(x,y);
        height=z;
    }
    int volume()
    {
        return (lenght*breadth*height);
    }
}
public class inheritance2 
{
    public static void main(String Args[])
    {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        Bedroom obj = new Bedroom(a,b,c);
        int i=obj.area();
        int j = obj.volume();
        System.out.println("Area is "+i);
        System.out.println("Volume is "+j);
    }
}
