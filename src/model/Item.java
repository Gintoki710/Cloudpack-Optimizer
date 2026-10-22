package model;

/**
 * Represents a cloud workload / microservice candidate in the CloudPack catalog.
 * Includes monthly cloud compute cost (for Knapsack DP), SLA throughput score,
 * memory footprint in GB RAM (for Host Node Bin Packing), and a descriptive overview.
 */
public class Item {
    private String id;
    private String name;
    private String category;
    private double price;       // Monthly Cost in $
    private int utility;        // SLA Throughput / Business Priority Score (points)
    private double weight;      // Memory Footprint in GB RAM
    private String description; // Descriptive architecture and purpose overview

    public Item(String id, String name, String category, double price, int utility, double weight, String description) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.utility = utility;
        this.weight = weight;
        this.description = description != null ? description : "";
    }

    public Item(String id, String name, String category, double price, int utility, double weight) {
        this(id, name, category, price, utility, weight, "High-performance containerized cloud microservice with automated health checks and horizontal scaling.");
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public double getPrice() {
        return price;
    }

    public int getUtility() {
        return utility;
    }

    public double getWeight() {
        return weight;
    }

    public String getDescription() {
        return description;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setUtility(int utility) {
        this.utility = utility;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Utility-to-price ratio used in Greedy Knapsack comparison.
     */
    public double getUtilityPerPrice() {
        return price > 0 ? (double) utility / price : 0;
    }

    @Override
    public String toString() {
        return String.format("%s ($%.2f/mo, %d pts, %.1f GB RAM)", name, price, utility, weight);
    }
}
