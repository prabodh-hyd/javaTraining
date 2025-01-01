package in.prabodh;

public class Printing <T> {
    T thingToPrint;
    public Printing(T thingToPrint) {
        this.thingToPrint = thingToPrint;
    }

    public void printInteger() {
        System.out.println(thingToPrint);
    }
}
//By extending a class you are specifying that the classes that are going to be passed as arguments will be inherited from the same inheritance the generic class has.
// You can extend a class and implement any interface with the generic class. And the argument should satisfy those requirements.
//General convention is to mentions 'T' as the type name but you mention whatever you want as long as it matches the type.