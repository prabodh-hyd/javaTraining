class UDGenerics<T>
{
  T obj;
  UDGenerics(T obj)
  {
      this.obj=obj;
  }
  public void show()
  {
      System.out.println("The type of object is :"+obj.getClass().getName());
  }
  public T getObject()
  {
    return obj;
  }
}
class GenericsDemo
{
     public static void main(String[] args)
      {
      UDGenerics<Integer> g1=new UDGenerics<Integer>(10);
      g1.show();
      System.out.println(g1.getObject());
      UDGenerics<String> g2=new UDGenerics<String>("bhaskar");
      g2.show();
      System.out.println(g2.getObject());
      UDGenerics<Double> g3=new UDGenerics<Double>(10.5);
      g3.show();
      System.out.println(g3.getObject());
      }
}
