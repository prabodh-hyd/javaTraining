class Animal
{
    void move()
    {
        System.out.println("Animal can move");
        System.out.println("Animal can eat");
    }
}
class Dog extends Animal
{
    void move()
    {
        System.out.println("Dogs are good");
        System.out.println("Dogs are loyal");
        System.out.println("Dogs can barke\n");
    }
}
class inherOverride
{
    public static void main(String Args[])
    {
        Animal obj1 = new Dog();
        Animal obj2 = new Animal();
        obj1.move();
        obj2.move();
    }
} 