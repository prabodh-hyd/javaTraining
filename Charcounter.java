import java.util.Scanner;
class Charcounter {
    public static void main(String[] args) {
        Scanner object = new Scanner(System.in);
        String user = object.nextLine();
        System.out.println(counter(user));
    }
    public static int counter(String word) {
        int count = 0;
        String letter = word;
        for (char havala : letter.toCharArray()) {
            count++;
        }
        return count;
    }
}
