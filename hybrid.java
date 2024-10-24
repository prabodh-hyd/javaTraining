import java.util.*;
class Student
{
    int rno;
    void getrno(int x)
    {
        rno=x;
    }
    void putrno()
    {
        System.out.println("Roll no is"+rno);
    }
}
class Test extends Student
{
    int marks1,marks2;
    void getmarks(int m1, int m2)
    {
        marks1=m1;
        marks2=m2;
    }
    void putmarks()
    {
        System.out.println("marks1 is "+marks1);
        System.out.println("marks is "+marks2);
    }
}
interface Sports
{
    float sportwt = 90.0f;
    void putwt();
}
class Result extends Test implements Sports
{
    float total;
    public void putwt()
    {
        System.out.println("Sports wt "+sportwt);
    }
    void display()
    {
        total = marks1+marks2+sportwt;
        putrno();
        putmarks();
        putwt();
        System.out.println("Total score = "+total);
    }
}

public class hybrid
{
    public static void main(String args[])
    {
        Result obj = new Result();
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        obj.getrno(a);
        obj.getmarks(b,c);
        obj.display();
    }
}