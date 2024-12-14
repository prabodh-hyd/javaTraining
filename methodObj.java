package in.javaDemo;

public class methodObj {

	int x = 10;
	static int y = 0;
	
	public static void main(String[] args) {
		
		methodObj myObj1 = new methodObj();
		myObj1.x = 25; 
		methodObj.y = 50;
		
		System.out.println("myObj1.x = " + myObj1.x);
		System.out.println("myObj1.y = " + y);
		
		
		
		methodObj myObj2 = new methodObj();
		
		myObj2.x = 30;
		System.out.println("myObj2.x = " + myObj2.x);
		System.out.println("myObj1.y = " + methodObj.y);
		
		methodObj.y = 70;
		System.out.println("myObj2.y = " + methodObj.y);
		System.out.println("myObj1.y = " + y);
		
//		Variables Demo v1 = new VariablesDemo();
//		v1.x = 20;
//		v1.y = 5;
//		v1.displayVars();
//		//System.out.println(x); // non-static variable
//		System.out.println("y = "+y);
//		//displayVars(); // non-static method
//		Variables Demo v2 = new Variables Demo();
//		v2.x=40;
//		v2.y=7;|
//		v2.displayVars();

	}

}
