////TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
//// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
//public class Main {
//    public static void main(String[] args) {
//        //TIP Press <shortcut actionId="ShowIntentionActions"/> with your caret at the highlighted text
//        // to see how IntelliJ IDEA suggests fixing it.
//        System.out.println("Hello and welcome!");
//
//        for (int i = 1; i <= 5; i++) {
//            //TIP Press <shortcut actionId="Debug"/> to start debugging your code. We have set one <icon src="AllIcons.Debugger.Db_set_breakpoint"/> breakpoint
//            // for you, but you can always add more by pressing <shortcut actionId="ToggleLineBreakpoint"/>.
//            System.out.println("i = " + i);
//        }
//    }
//}
//public class Main {
//    public static void main(String[] args) {
////        String a = "Alex";
//        int age = 21;
////        float age2 = 2.2f;
////        char character = 'N';
////        boolean isOkay = false;
////        System.out.println(age * age2);
////        System.out.println(character);
////        System.out.println(isOkay);
//        System.out.println("Hello");
//short max = Short.MAX_VALUE;
//int number = 10;
//int vote = 21;
//int drink = 18;
//        if (number == 10) {
//            System.out.println("They are equal");
//        }
//        if (vote == 21) {
//            System.out.println("You can vote");
//        }
//        if (vote == 21 & drink >= 15) {
//            System.out.println("You can Drink");
//
////        for (int i = 1; i <= 5; i++) {
////            //TIP Press <shortcut actionId="Debug"/> to start debugging your code. We have set one <icon src="AllIcons.Debugger.Db_set_breakpoint"/> breakpoint
////            // for you, but you can always add more by pressing <shortcut actionId="ToggleLineBreakpoint"/>.
////            System.out.println("i = " + i);
//        }
//        if (vote < 25 & drink < 25) {
//        System.out.printf("You can't drink because your age should be ");
//        }
//        else {
//            System.out.println("Come on in drinks are in the fridge.\nIf you want you can even go to the terrace");
//        }
//import java.util.*;
//class running {
//    Scanner scanner = new Scanner(System.in);
//    void runaround() {
//        System.out.println("Enter the number: ");
//        int time = scanner.nextInt();
//
//        switch (time) {
//            case 10 -> System.out.println("The time is " + time + "\nTime for a coffee");
//
//            case 12 -> System.out.println("The time is " + time + "\nTime for a Run");
//
//            case 15 -> System.out.println("Voila");
//
//            default -> System.out.println("Just go!");
//        }
//    }
//}
public class Main {
    public static void main(String[] args) {
        int [] numbers = {12,14,15,23,26,56,78,56,99,69};
        for (int i : numbers) {
            System.out.println(i);
        }
        System.out.println("Desired number is " + numbers[9] + "\n");
        String [] friends = {"Ravi","Sudha","Shiva","Venu","Alex"};
        for (String friend: friends) {
            System.out.println(friend);
        }
        int[] numbers2 = new int[3];
        numbers2[0] = 1;
        numbers2[1] = 2;
        numbers2[2] = 3;
    }
}