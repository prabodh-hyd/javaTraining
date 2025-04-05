public class ElonsToyCar {
    int distance;
    int battery;
    public ElonsToyCar() {
        this.distance = 0;
        this.battery = 100;
    }
    public static ElonsToyCar buy() {
        return new ElonsToyCar();
    }

    public String distanceDisplay() {
        return "Driven " + this.distance + " meters";
    }

    public String batteryDisplay() {
        if (this.battery > 0) {
            return "Battery at " + this.battery + "%";
        }
        else {
            return "Battery empty";
        }

    }

    public void drive() {
        if (this.battery > 0) {
            this.distance += 20;
            this.battery -= 1;
        }
    }
}
