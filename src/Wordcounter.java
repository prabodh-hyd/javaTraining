import java.util.Scanner;
class Wordcounter {
    public static void main(String[] args) {
        Scanner object = new Scanner(System.in);
        String user = object.nextLine();
        System.out.println(counter(user));
    }
    public static int counter(String word) {
        int count = 0;
        String[] letter = word.split(" ");
        for (String havala : letter) {
            count++;
        }
        return count;
    }
}
