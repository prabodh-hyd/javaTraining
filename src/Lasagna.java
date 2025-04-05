public class Lasagna {
    public int expectedMinutesInOven() {
       return 40;
    }
    public int remainingMinutesInOven(int min) {
        int inoven = expectedMinutesInOven();
        return inoven - min;
    }
    public int preparationTimeInMinutes(int time) {
        return time * 2;
    }
    public int totalTimeInMinutes(int layer, int work) {
        int time_taken = preparationTimeInMinutes(layer);
        return (work + time_taken);
    }
}
