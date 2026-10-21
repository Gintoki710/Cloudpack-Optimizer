package model;

import java.util.List;

/**
 * Represents the finalized cluster workload deployment manifest and printable FinOps audit.
 * Generates structured telemetry text compressed via Huffman Coding.
 */
public class OrderInvoice {
    private String invoiceNumber;
    private String customerName;
    private String organization;
    private String timestamp;
    private List<Item> items;
    private List<Box> boxes;
    private double itemsTotalCost;
    private double totalWeight;
    private int totalUtility;
    private double courierFeePerBox;
    private double totalCourierFee;
    private double grandTotal;
    private String rawInvoiceText;

    public OrderInvoice(String invoiceNumber, String customerName, String organization, String timestamp,
                        List<Item> items, List<Box> boxes, double courierFeePerBox) {
        this.invoiceNumber = invoiceNumber;
        this.customerName = customerName;
        this.organization = organization;
        this.timestamp = timestamp;
        this.items = items;
        this.boxes = boxes;
        this.courierFeePerBox = courierFeePerBox;

        // Calculate totals
        double cost = 0.0;
        double weight = 0.0;
        int utility = 0;
        for (Item item : items) {
            cost += item.getPrice();
            weight += item.getWeight();
            utility += item.getUtility();
        }
        this.itemsTotalCost = Math.round(cost * 100.0) / 100.0;
        this.totalWeight = Math.round(weight * 1000.0) / 1000.0;
        this.totalUtility = utility;
        this.totalCourierFee = Math.round(boxes.size() * courierFeePerBox * 100.0) / 100.0;
        this.grandTotal = Math.round((this.itemsTotalCost + this.totalCourierFee) * 100.0) / 100.0;

        this.rawInvoiceText = generateRawInvoiceText();
    }

    private String generateRawInvoiceText() {
        StringBuilder sb = new StringBuilder();
        sb.append("============================================================\n");
        sb.append("       CLOUDPACK • CLUSTER PROVISIONING & FINOPS AUDIT       \n");
        sb.append("          KUBERNETES WORKLOAD & NODE ALLOCATION REPORT       \n");
        sb.append("============================================================\n");
        sb.append("Manifest ID : ").append(invoiceNumber).append("\n");
        sb.append("Timestamp   : ").append(timestamp).append("\n");
        sb.append("Cluster Lead: ").append(customerName).append("\n");
        sb.append("Cluster Org : ").append(organization).append("\n");
        sb.append("------------------------------------------------------------\n");
        sb.append(String.format("%-4s %-26s %-10s %-8s %-8s\n", "No.", "Microservice Workload", "Cost($/mo)", "SLA(pts)", "RAM"));
        sb.append("------------------------------------------------------------\n");

        int idx = 1;
        for (Item item : items) {
            sb.append(String.format("%-4d %-26s %-10.2f %-8d %-7.1fGB\n",
                    idx++,
                    item.getName().length() > 26 ? item.getName().substring(0, 23) + "..." : item.getName(),
                    item.getPrice(),
                    item.getUtility(),
                    item.getWeight()));
        }

        sb.append("------------------------------------------------------------\n");
        sb.append(String.format("Total Workload Cost :  $ %.2f / mo\n", itemsTotalCost));
        sb.append(String.format("Total SLA Throughput:  %d points\n", totalUtility));
        sb.append(String.format("Total Cluster Memory:  %.2f GB RAM\n", totalWeight));
        sb.append("------------------------------------------------------------\n");
        sb.append("PHYSICAL BARE-METAL SERVER CONSOLIDATION (FFD HEURISTIC):\n");
        for (Box b : boxes) {
            sb.append(String.format(" * Node #%d: %.1f/%.1f GB RAM (%.1f%% utilized) - %d pods scheduled\n",
                    b.getBoxId(), b.getCurrentWeight(), b.getMaxCapacity(), b.getUtilizationPercentage(), b.getItems().size()));
        }
        sb.append("------------------------------------------------------------\n");
        sb.append(String.format("Active Host Nodes   :  %d Bare-Metal Servers\n", boxes.size()));
        sb.append(String.format("Node Lease / Server :  $ %.2f / mo\n", courierFeePerBox));
        sb.append(String.format("Physical Host Spend :  $ %.2f / mo\n", totalCourierFee));
        sb.append("------------------------------------------------------------\n");
        sb.append(String.format("TOTAL CLOUD SPEND   :  $ %.2f / mo\n", grandTotal));
        sb.append("============================================================\n");
        sb.append("  Algorithmic Verification: 0/1 Knapsack DP & Bin Packing FFD\n");
        sb.append("  Compressed with Huffman Coding (Experiment 14 / Mod 4)    \n");
        sb.append("============================================================\n");
        return sb.toString();
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getOrganization() {
        return organization;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public List<Item> getItems() {
        return items;
    }

    public List<Box> getBoxes() {
        return boxes;
    }

    public double getItemsTotalCost() {
        return itemsTotalCost;
    }

    public double getTotalWeight() {
        return totalWeight;
    }

    public int getTotalUtility() {
        return totalUtility;
    }

    public double getCourierFeePerBox() {
        return courierFeePerBox;
    }

    public double getTotalCourierFee() {
        return totalCourierFee;
    }

    public double getGrandTotal() {
        return grandTotal;
    }

    public String getRawInvoiceText() {
        return rawInvoiceText;
    }
}
