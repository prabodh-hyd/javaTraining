public class CarsAssemble {

    public double productionRatePerHour(int speed) {
        double production;
        if (speed < 5) {
            production = (221 * speed) * 100/100;
        }
        else if (speed < 9) {
            production = (221 * speed) * (90.0/100);
        }
        else if (speed == 9) {
            production = (221 * speed) * (80.0/100);
        }
        else if (speed == 10) {
            production = (221 * speed) * (77.0/100);
        }
        else {
            production = 0;
        }
        return production;
    }

    public int workingItemsPerMinute(int speed) {
        int perHour = 221 * speed;
        int working;
        if (speed < 5) {
            working = ((perHour * 100/100) / 60);
        }
        else if (speed < 9) {
            working = ((perHour * 90/100) / 60);
        }
        else if (speed == 9) {
            working = ((perHour * 80/100) / 60);
        }
        else if (speed == 10){
            working = ((perHour * 77/100) / 60);
        }
        else {
            working = 0;
        }
        return working;
    }
}
