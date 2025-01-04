package in.prabodh.ThreadSynchronization;

import java.util.concurrent.locks.Lock;

public class NotifyAllDemo {
    private static final Object LOCK = new Object();
    public static void main(String[] args) {
        Thread mainThread = Thread.currentThread();
        Thread one = new Thread(() -> {
            try {
                one();
            } catch (InterruptedException e) {
                throw new RuntimeException("Interrupted while waiting");
            }
        });

        Thread two = new Thread(() -> {
            try {
                two();
            } catch (InterruptedException e) {
                throw new RuntimeException("Interrupted while waiting");
            }
        });

        Thread three = new Thread(() -> {
            try {
                three();
            } catch (InterruptedException e) {
                throw new RuntimeException("Interrupted while waiting");
            }
        });

        Thread four = new Thread(() -> {
            try {
                four();
            } catch (InterruptedException e) {
                throw new RuntimeException("Interrupted while waiting");
            }
        });

        one.start();
        two.start();
        three.start();
        four.start();
        
//        System.out.println(one.getPriority());
//        System.out.println(two.getPriority());
//        System.out.println(three.getPriority());
//        System.out.println(four.getPriority());

    }

    private static void one() throws InterruptedException {
        synchronized (LOCK) {
            System.out.println("One is waiting");
            LOCK.wait();
            System.out.println("One is notified and execution is complete");
        }
    }

    private static void two() throws InterruptedException{
        synchronized (LOCK) {
            System.out.println("Two is active");
//            Thread.sleep(1000);
            LOCK.notifyAll();
            System.out.println("Two execution is completed, notified all.");
        }
    }

    private static void three() throws InterruptedException{
        synchronized (LOCK) {
            System.out.println("Three getting started");
            LOCK.wait();
            System.out.println("Three is active");
            System.out.println("Three execution is completed");
        }
    }

    private static void four() throws InterruptedException{
        synchronized (LOCK) {
            System.out.println("Four getting started");
            LOCK.wait();
            System.out.println("Four is active");
            System.out.println("Four execution is completed");
        }
    }
}
