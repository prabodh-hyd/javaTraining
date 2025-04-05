package in.prabodh;

import java.util.concurrent.atomic.AtomicInteger;

public class Main {

    private static final Object lock = new Object();
    private static AtomicInteger executionOrder = new AtomicInteger(); //This is used cause it's thread safe, more study needs to be done on this one...

    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            synchronized (lock) {
                System.out.println("Thread 1 waiting...");
                while (executionOrder.get() != 1) {
                    try {
                        lock.wait(10);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("Thread 1 resumed.");
                executionOrder.incrementAndGet();
            }
        });

        Thread thread2 = new Thread(() -> {
            synchronized (lock) {
                System.out.println("Thread 2 waiting...");
                while (executionOrder.get() != 2) {
                    try {
                        lock.wait(10); //
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("Thread 2 resumed.");
                executionOrder.incrementAndGet();
            }
        });

        Thread thread3 = new Thread(() -> {
            synchronized (lock) {
                System.out.println("Thread 3 waiting...");
                while (executionOrder.get() != 3) {
                    try {
                        lock.wait(10);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.println("Thread 3 resumed.");
                executionOrder.incrementAndGet();
            }
        });

        Thread thread4 = new Thread(() -> {
            synchronized (lock) {
                try {
                    System.out.println("Thread 4 preparing...");
                    Thread.sleep(1000);
                    lock.notifyAll();
                    executionOrder.set(1);
                    thread1.setPriority(Thread.MAX_PRIORITY);
                    System.out.println("Thread 4 notified all.");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

//        thread4.setPriority(Thread.NORM_PRIORITY - 4);

        // Start threads
        thread3.start();
        thread2.start();
        thread1.start();
        thread4.start();
    }
}
