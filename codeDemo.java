package in.javaDemo;
import java.util.*;

public class codeDemo {
	float a,b;
	static Scanner sc = new Scanner(System.in);
	public static void main(String[] args) {
		boolean flag = true;
		
		
		while(flag) {
			System.out.println("1.Sum Of Digits\r\n"+ "2.Reversing a number\r\n"+ "3.Check Prime number\r\n"+ "4.Generate fibonacci series\r\n"+ "5.Check for Palindrome\r\n"+ "6.Greatest of three numbers\r\n"+ "7.Exit\n");
			System.out.print("Enter your choice from above list : ");
			int choice = sc.nextInt();
			switch(choice) {
			case 1:
				System.out.print("Enter the value of a : ");
				float x = sc.nextFloat();
				System.out.print("Enter the value of b : ");
				float y = sc.nextFloat();
				System.out.print("\r\n");
				sumOfDigits(x,y);
				break;
			case 2:
				System.out.print("Enter a number : ");
				int num = sc.nextInt();
				reverseNumber(num);
				break;
			case 3:
			    System.out.print("Enter a number : ");
                int n = sc.nextInt();
                checkPrime(n);
                break;
			case 4:
				System.out.print("Enter the number of terms : ");
				int terms = sc.nextInt();
				fibonacciSeries(terms);
				break;
			case 5:
				System.out.print("Enter a number : ");
				int num1 = sc.nextInt();
				checkPalondrome(num1);
				break;
			case 6:
				System.out.print("Enter the value of a : ");
				int a = sc.nextInt();
				System.out.print("Enter the value of b : ");
				int b = sc.nextInt();
				System.out.print("Enter the value of c : ");
				int c = sc.nextInt();
				greatestOfThreeNumbers(a, b, c);
				break;
			case 7:
				exit(flag);
				break;
			default:
				System.out.println("Invalid choice");
				break;
			}
		}
		System.out.println("Thank you.");
	}
	
	static void sumOfDigits(float a, float b ) {
	
		System.out.println("Sum of a and b is : "+(a+b));
		System.out.print("\r\n");
	}
	static void reverseNumber(int num) {
		int rev=0, rem=0;
		while(num>0) {
		rem = num%10;
		rev = rem+(rev*10);
		num = num/10;
		}
		System.out.println(rev);
		System.out.print("\r\n");
	}

	static void checkPrime(int n) {
		boolean flag = true;
		for (int i = 2; i < n; i++) {
			if (n % i == 0) {
				flag = false;
				break;
			}
		}
		if (flag) {
			System.out.println(n + " is a Prime number");
			System.out.print("\r\n");
		} else {
			System.out.println(n + " is Not a prime number");
			System.out.print("\r\n");
		}
	}

	static void fibonacciSeries(int terms) {
		int n1 = 0, n2 = 1, n3;
		System.out.print(n1 + " " + n2);
		for (int i = 2; i < terms; i++) {
			n3 = n1 + n2;
			System.out.print(" " + n3);
			n1 = n2;
			n2 = n3;
		}
		System.out.print("\r\n");
	}
	static void checkPalondrome(int num) {
		int temp = num;
		int rev1 = 0, rem1 = 0;
		do {
			rem1 = num % 10;
            rev1 = rem1 + (rev1 * 10);
            num = num / 10;
		}while (num > 0); 
		if (temp == rev1) {
			System.out.println(temp + " is a Palindrome number");
			System.out.print("\r\n");
		} else {
			System.out.println(temp + " is Not a Palindrome number");
			System.out.print("\r\n");
		}
	}
	static void greatestOfThreeNumbers(int a,int b, int c) {
		int max;
		max = (a>b)?a:b;
		max = (max>c)?max:c;
		System.out.println("Greatest of three numbers is : "+max);
		System.out.print("\r\n");
	}

	static void exit(boolean flag) {
		flag = false;
	}
}
