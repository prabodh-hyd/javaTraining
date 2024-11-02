import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner obj = new Scanner(System.in);
        System.out.println("A? ");
        int a = obj.nextInt();
        System.out.println("B? ");
        int b = obj.nextInt();
        int[] values = exchange(a, b);
        System.out.println("Exchanged Numbers are A = " + values[0] + " B = " + values[1]);
        
        
    }
    public static int[] exchange(int a, int b) {
        a = a + b;
        b = a - b;
        a = a - b;
        return new int[]{a, b};
    }
}
