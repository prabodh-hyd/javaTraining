package in.prabodh;

public class Methods {
    public static void main(String[] args) {
    shout("Boy");
    shout(25);
    shout(3.14);
    shout(new StringPrinting("R"));
    shoutTwo(35, "R");
    }

    public static <T> void shout(T thingToPrint) {
        System.out.println(thingToPrint + "!!!!!!!!");
    }

    public static <T, V>void shoutTwo(T one, V two) {
        System.out.println("IDK1 - " + one + ". IDK2 - " + two);
    }
}
//You can return the generic type by specifying at the void same as int or float.