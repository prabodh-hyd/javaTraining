import java.util.*;

public class task1 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		boolean condition = true;
		
		while(condition) {
			System.out.println("1.Sum Of Digits\n"+ "2.Reverse a number\n"+ "3.Check whether a number is Prime number or not\n"+ "4.Generate fibonacci series\n"+ "5.Check whether a number is Palindrome or not\n"+ "6.Exit\n");
			System.out.print("Choose an operation from the above list : ");
			int input = sc.nextInt();
			switch(input) {
			case 1:
				System.out.print("Enter the value of a : ");
				float a = sc.nextFloat();
				System.out.print("Enter the value of b : ");
				float b = sc.nextFloat();
				System.out.print("\n");
				System.out.println("Sum of a and b is : "+(a+b));
				System.out.print("\n");
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
				System.out.print("\n");
				break;
			case 3:
			    System.out.print("Enter a number : ");
                int n = sc.nextInt();
                boolean prime = true;
                for(int i=2;i<n;i++) {
                    if(n%i==0) {
                        prime = false;
                        break;
                    }
                }
                if(prime) {
                    System.out.println(n+" is a Prime number");
                    System.out.print("\n");
                }
                else {
                    System.out.println(n+" is not a Prime number");
                    System.out.print("\n");
                }
                break;
			case 4:
				System.out.print("Enter the number of fibonacci numbers you want : ");
				int terms = sc.nextInt();
				int n1 = 0, n2 = 1, n3;
				System.out.print(n1 + " " + n2);
				for (int i = 2; i < terms; i++) {
					n3 = n1 + n2;
					System.out.print(" " + n3);
					n1 = n2;
					n2 = n3;
				}
				System.out.print("\n");
				break;
			case 5:
				System.out.print("Enter a number : ");
				int number = sc.nextInt();
				int fake = number;
				int reverse = 0, remain = 0;
				do {
					remain = number % 10;
                    reverse = remain + (reverse * 10);
                    number = number / 10;
				}while (number > 0); 
				if (fake == reverse) {
					System.out.println(fake + " is a Palindrome number");
					System.out.print("\n");
				} else {
					System.out.println(fake + " is Not a Palindrome number");
					System.out.print("\n");
				}
				break;
			case 6:
				condition = false;
				System.out.println("You chose to exit.");
				System.out.print("\n");
				break;
			default:
				System.out.println("Wrong choice, Choose again.");
				break;
			}
		}
	}
}