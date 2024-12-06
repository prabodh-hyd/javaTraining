package in.javaDemo;
import java.util.*;

public class codeDemo {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		boolean flag = true;
		
		while(flag) {
			System.out.println("1.Sum Of Digits\r\n"+ "2.Reversing a number\r\n"+ "3.Check Prime number\r\n"+ "4.Generate fibonacci series\r\n"+ "5.Check for Palindrome\r\n"+ "6.Exit\n");
			System.out.print("Enter your choice from above list : ");
			int choice = sc.nextInt();
			switch(choice) {
			case 1:
				System.out.print("Enter the value of a : ");
				float a = sc.nextFloat();
				System.out.print("Enter the value of b : ");
				float b = sc.nextFloat();
				System.out.print("\r\n");
				System.out.println("Sum of a and b is : "+(a+b));
				System.out.print("\r\n");
				break;
			case 2:
				System.out.print("Enter a number : ");
				int num = sc.nextInt();
				int rev=0, rem=0;
				while(num>0) {
				rem = num%10;
				rev = rem+(rev*10);
				num = num/10;
				}
				System.out.println(rev);
				System.out.print("\r\n");
				break;
			case 3:
			    System.out.print("Enter a number : ");
                int n = sc.nextInt();
                boolean flag1 = true;
                for(int i=2;i<n;i++) {
                    if(n%i==0) {
                        flag1 = false;
                        break;
                    }
                }
                if(flag1) {
                    System.out.println(n+" is a Prime number");
                    System.out.print("\r\n");
                }
                else {
                    System.out.println(n+" is Not a prime number");
                    System.out.print("\r\n");
                }
                break;
			case 4:
				System.out.print("Enter the number of terms : ");
				int terms = sc.nextInt();
				int n1 = 0, n2 = 1, n3;
				System.out.print(n1 + " " + n2);
				for (int i = 2; i < terms; i++) {
					n3 = n1 + n2;
					System.out.print(" " + n3);
					n1 = n2;
					n2 = n3;
				}
				System.out.print("\r\n");
				break;
			case 5:
				System.out.print("Enter a number : ");
				int num1 = sc.nextInt();
				int temp = num1;
				int rev1 = 0, rem1 = 0;
				do {
					rem1 = num1 % 10;
                    rev1 = rem1 + (rev1 * 10);
                    num1 = num1 / 10;
				}while (num1 > 0); 
				if (temp == rev1) {
					System.out.println(temp + " is a Palindrome number");
					System.out.print("\r\n");
				} else {
					System.out.println(temp + " is Not a Palindrome number");
					System.out.print("\r\n");
				}
				break;
			case 6:
				flag = false;
				System.out.println("Program has been stopped !");
				System.out.print("\r\n");
				break;
			default:
				System.out.println("Invalid choice");
				break;
			}
		}
		System.out.println("Thank you.");
	}
}
