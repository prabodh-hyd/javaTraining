
class BirdWatcher {
    private final int[] birdsPerDay;

    public BirdWatcher(int[] birdsPerDay) {
        this.birdsPerDay = birdsPerDay.clone();
    }

    public int[] getLastWeek() {
        return this.birdsPerDay;
    }

    public int getToday() {
        return this.birdsPerDay[this.birdsPerDay.length - 1];
    }

    public void incrementTodaysCount() {
        int num = getToday();
        this.birdsPerDay[this.birdsPerDay.length - 1] = num + 1;
    }

    public boolean hasDayWithoutBirds() {
        for (int day: this.birdsPerDay) {
            if (day == 0) {
                return true;
            }
        }
        return false;
    }

    public int getCountForFirstDays(int numberOfDays) {
        int sum = 0;
        if (numberOfDays > 7) {
            numberOfDays = 7;
        }
        for (int i = 0; i <= numberOfDays - 1; i++) {
            sum += this.birdsPerDay[i];
        }
        return sum;
    }

    public int getBusyDays() {
        int busy = 0;
        for (int i: this.birdsPerDay) {
            if (i >= 5) {
                busy++;
            }
        }
        return busy;
    }
}
