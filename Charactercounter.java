import java.util.Scanner;
class Charactercounter {
    public static void main(String[] args) {
        Scanner object = new Scanner(System.in);
        System.out.println("Give the input: ");
        String user = object.nextLine();
        System.out.println("Which character you want to count?: ");
        char input = object.next().charAt(0);
        System.out.println("No.of times '" + input + "' has repeated is " + counter(user, input));
    }
    public static int counter(String word, char what) {
        int count = 0;
        for (char havala : word.toCharArray()) {
            if (havala == what) {
                count++;
            }
        }
        return count;
    }
}
