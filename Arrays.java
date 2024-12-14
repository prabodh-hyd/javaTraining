package in.javaDemo;

public class Arrays {

	public static void main(String[] args) {
		
		System.out.println("No of values passed from command line : "+args.length);
		for(int k =0; k<args.length;k++)
		System.out.println(args[k]);
		
		System.out.println("\n");
		int[] values = {11,2,3,4,5};
		System.out.println("length of array values: "+values.length);
//		System.out.println("Value at position :"+values[3]);
//		System.out.println("Value at position 1: "+values[0]);
//		System.out.println("Value at position 2: "+values [1]);
//		System.out.println("Value at position 3: "+values [2]);
//		System.out.println("Value at position 4: "+values [3]);
//		System.out.println("Value at position 5: "+values [4]);
		
		for(int i=0;i<values.length;i++)
			System.out.println("Value at position "+i+": "+values[i]);
		
		System.out.println("\n");
		int[] marks = new int[10];
		//System.out.println("length of array values: "+marks.length);
		
		marks[1]=29;
		for(int j=0;j<marks.length;j++)
			System.out.println("Value at position "+j+": "+marks[j]);
		
	}

}
