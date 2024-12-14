package in.javaDemo;

public class classNObj {

	public static void main(String[] args) {
		Student obj1 = new Student(40731092,"Shiva raj","A+");
		obj1.stuDetails();
		
//		Student s1;   //error
		Student s1=obj1;   //here we have one object and two reference. 
//		s1.stuDetails();
		
		Student obj2 = new Student(40731091,"Dinesh Sheelam","A");
		obj2.stuDetails();
//		How we read the above statement is "s1 is a reference of type Student."
		
		System.out.println("\n"+s1+"\n"+obj1+"\n");
		
		
		new Student().stuDetails();	
		
	}

}
class Student{
//	int studentNo; 
//	String studentName;
//	String grade;
	private int studentNo;
	private String studentName;
	private String grade;
	
	Student(){
		studentNo = 1000;
		studentName = "---";
		grade = "---";
	
	}
	
	Student(int studentNo,String studentName, String grade){
		this.studentNo = studentNo;
		this.studentName = studentName;
		this.grade = grade;
	}
	
	public void stuDetails() {
		System.out.println("    STUDENT DETAILS    ");
		System.out.println("=======================");
		System.out.println("NAME : "+studentName);
		System.out.println("ROLL NO. : "+studentNo);
		System.out.println("GRADE : "+grade);
	}
}
