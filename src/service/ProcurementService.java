package service;

import dsa.binpacking.BinPackingSolver;
import dsa.huffman.HuffmanCompressor;
import dsa.knapsack.KnapsackSolver;
import dsa.stack.CartAction;
import dsa.stack.CartHistoryManager;
import dsa.tree.AVLTree;
import model.Item;
import model.OrderInvoice;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * CloudClusterService (ProcurementService)
 * Core business logic controller for CloudPack Cluster Scheduling & FinOps Budgeting.
 * Coordinates the AVL Microservice Registry, LIFO Rollout Stack, and Default Node Capacities.
 */
public class ProcurementService {
    private final AVLTree catalogTree;
    private final Map<String, Item> catalogLookup;
    private final CartHistoryManager cartHistory;
    private double defaultBoxCapacity; // Host Node RAM Capacity in GB (default: 64.0 GB)
    private double courierFeePerBox;   // Host Node Lease & Power Cost in $ (default: $120.0/mo)

    public ProcurementService() {
        this.catalogTree = new AVLTree();
        this.catalogLookup = new HashMap<>();
        this.cartHistory = new CartHistoryManager();
        this.defaultBoxCapacity = 64.0;
        this.courierFeePerBox = 120.0;

        // Load default preset: Enterprise Kubernetes Cluster
        loadPreset("ENTERPRISE_K8S");
    }

    public synchronized void loadPreset(String presetKey) {
        catalogTree.clear();
        catalogLookup.clear();

        List<Item> initialItems = new ArrayList<>();

        if ("FINTECH_AI_CLOUD".equalsIgnoreCase(presetKey)) {
            // Preset 2: High-Frequency Trading & AI Cloud Workloads
            // 1. Trading Engines (3 items)
            addItemToCatalog(new Item("F01", "Ultra-Low Latency Order Matcher", "Trading Engines", 650.0, 99, 28.0));
            addItemToCatalog(new Item("F02", "FIX Protocol Gateway Bridge", "Trading Engines", 380.0, 92, 12.0));
            addItemToCatalog(new Item("F03", "Market Data WebSocket Feed", "Trading Engines", 290.0, 88, 8.0));

            // 2. AI & LLMs (3 items)
            addItemToCatalog(new Item("F04", "Llama-3 8B Quantized Inference Pod", "AI & LLMs", 540.0, 97, 24.0));
            addItemToCatalog(new Item("F05", "LangChain RAG Vector Embeddings DB", "AI & LLMs", 360.0, 90, 16.0));
            addItemToCatalog(new Item("F06", "Whisper Speech Transcription Worker", "AI & LLMs", 220.0, 84, 10.0));

            // 3. Risk & Ledger (3 items)
            addItemToCatalog(new Item("F07", "Distributed Double-Entry Ledger", "Risk & Ledger", 410.0, 95, 16.0));
            addItemToCatalog(new Item("F08", "Real-Time Risk Calculation Daemon", "Risk & Ledger", 470.0, 96, 20.0));
            addItemToCatalog(new Item("F09", "KYC & Anti-Money Laundering Pod", "Risk & Ledger", 260.0, 86, 8.0));

            // 4. Databases & In-Memory (3 items)
            addItemToCatalog(new Item("F10", "TimescaleDB Financial Time-Series", "Databases", 330.0, 91, 14.0));
            addItemToCatalog(new Item("F11", "Aerospike Ultra-Fast NoSQL Cluster", "Databases", 490.0, 94, 22.0));
            addItemToCatalog(new Item("F12", "Cassandra Write-Heavy Audit Store", "Databases", 380.0, 89, 16.0));

            // 5. Edge & Networking (2 items)
            addItemToCatalog(new Item("F13", "Envoy Global Service Mesh Proxy", "Edge & Network", 190.0, 87, 6.0));
            addItemToCatalog(new Item("F14", "BGP Anycast Edge Route Optimizer", "Edge & Network", 240.0, 85, 4.0));

            // 6. Compliance & Vault (2 items)
            addItemToCatalog(new Item("F15", "Hardware Security Module (HSM) Pod", "Security & Vault", 520.0, 98, 8.0));
            addItemToCatalog(new Item("F16", "PCI-DSS Continuous Audit Collector", "Security & Vault", 180.0, 82, 4.0));

            // 7. Notification & Delivery (3 items)
            addItemToCatalog(new Item("F17", "High-Throughput Push Notification Worker", "Async Workers", 140.0, 78, 4.0));
            addItemToCatalog(new Item("F18", "SMS & Multi-Channel Alert Dispatcher", "Async Workers", 120.0, 76, 3.0));
            addItemToCatalog(new Item("F19", "Automated Billing & FinOps Collector", "Async Workers", 160.0, 81, 5.0));
        } else {
            // Preset 1 (Default): Enterprise Kubernetes Microservices & APIs
            // 1. Databases (3 items)
            addItemToCatalog(new Item("K01", "PostgreSQL High-Availability Cluster", "Databases", 340.0, 95, 16.0));
            addItemToCatalog(new Item("K02", "MongoDB Sharded Replica Set", "Databases", 280.0, 89, 12.0));
            addItemToCatalog(new Item("K03", "Redis Distributed Cache Cluster", "Databases", 140.0, 82, 8.0));

            // 2. APIs & Gateways (3 items)
            addItemToCatalog(new Item("K04", "Kong Enterprise API Gateway", "APIs & Gateways", 190.0, 92, 6.0));
            addItemToCatalog(new Item("K05", "OAuth2 JWT Identity Microservice", "APIs & Gateways", 110.0, 86, 4.0));
            addItemToCatalog(new Item("K06", "GraphQL Federation Mesh Router", "APIs & Gateways", 150.0, 88, 5.0));

            // 3. Messaging & Streaming (3 items)
            addItemToCatalog(new Item("K07", "Apache Kafka 3-Node Event Broker", "Messaging", 420.0, 96, 20.0));
            addItemToCatalog(new Item("K08", "RabbitMQ Distributed Task Queue", "Messaging", 160.0, 84, 6.0));
            addItemToCatalog(new Item("K09", "NATS JetStream Telemetry Broker", "Messaging", 120.0, 78, 4.0));

            // 4. AI & Analytics (3 items)
            addItemToCatalog(new Item("K10", "Real-Time Fraud Detection Engine", "AI & Analytics", 480.0, 98, 24.0));
            addItemToCatalog(new Item("K11", "Apache Spark Analytics Worker Pod", "AI & Analytics", 320.0, 87, 16.0));
            addItemToCatalog(new Item("K12", "TensorFlow Serving Prediction API", "AI & Analytics", 390.0, 91, 18.0));

            // 5. Observability & Logs (3 items)
            addItemToCatalog(new Item("K13", "Elasticsearch Search & Index Pod", "Observability", 290.0, 88, 14.0));
            addItemToCatalog(new Item("K14", "Prometheus Metrics Time-Series DB", "Observability", 180.0, 85, 8.0));
            addItemToCatalog(new Item("K15", "Grafana Dashboard & Alerting Pod", "Observability", 85.0, 74, 2.0));

            // 6. Security & Storage (3 items)
            addItemToCatalog(new Item("K16", "HashiCorp Vault Secrets Cluster", "Security", 210.0, 94, 6.0));
            addItemToCatalog(new Item("K17", "MinIO Distributed S3 Object Store", "Security", 260.0, 89, 12.0));
            addItemToCatalog(new Item("K18", "WAF Cloudflare Ingress Controller", "Security", 95.0, 80, 3.0));

            // 7. DevOps & CI/CD (3 items)
            addItemToCatalog(new Item("K19", "ArgoCD GitOps Deployment Daemon", "DevOps & CI/CD", 130.0, 83, 4.0));
            addItemToCatalog(new Item("K20", "SonarQube Static Code Analyzer", "DevOps & CI/CD", 160.0, 79, 6.0));
            addItemToCatalog(new Item("K21", "Docker Registry Private Cache", "DevOps & CI/CD", 90.0, 72, 4.0));
        }

        // Initialize active deployment cart with balanced foundational microservices
        List<Item> all = catalogTree.inOrderList();
        if (all.size() >= 5) {
            initialItems.add(all.get(0));
            initialItems.add(all.get(1));
            initialItems.add(all.get(2));
            initialItems.add(all.get(3));
            if (all.size() >= 6) {
                initialItems.add(all.get(5));
            }
        }
        cartHistory.reset(initialItems);
    }

    public synchronized void addItemToCatalog(Item item) {
        catalogTree.insert(item);
        catalogLookup.put(item.getId(), item);
    }

    public synchronized boolean removeItemFromCatalog(String itemId) {
        Item item = catalogLookup.get(itemId);
        if (item != null) {
            boolean removed = catalogTree.delete(itemId, item.getPrice());
            if (removed) {
                catalogLookup.remove(itemId);
                return true;
            }
        }
        return false;
    }

    public List<Item> getCatalogInOrder() {
        return catalogTree.inOrderList();
    }

    /**
     * AVL Tree Cost-Range Query (O(log N + K))
     */
    public List<Item> filterCatalogByPriceRange(double minPrice, double maxPrice) {
        return catalogTree.rangeSearch(minPrice, maxPrice);
    }

    public Map<String, Object> getCatalogTreeHierarchy() {
        return catalogTree.toVisualHierarchy();
    }

    public int getCatalogSize() {
        return catalogTree.size();
    }

    public int getCatalogTreeHeight() {
        return catalogTree.getTreeHeight();
    }

    // --- Cluster Deployment State Management with LIFO Stack ---

    public synchronized List<Item> getCurrentCart() {
        return cartHistory.getCurrentCart();
    }

    public synchronized void addItemToCart(String itemId) {
        Item item = catalogLookup.get(itemId);
        if (item != null) {
            List<Item> newCart = new ArrayList<>(cartHistory.getCurrentCart());
            newCart.add(item);
            cartHistory.execute(CartAction.Type.ADD_ITEM, "Deployed microservice: " + item.getName(), newCart);
        }
    }

    public synchronized void removeItemFromCart(int index) {
        List<Item> current = cartHistory.getCurrentCart();
        if (index >= 0 && index < current.size()) {
            List<Item> newCart = new ArrayList<>(current);
            Item removed = newCart.remove(index);
            cartHistory.execute(CartAction.Type.REMOVE_ITEM, "Terminated microservice: " + removed.getName(), newCart);
        }
    }

    public synchronized void clearCart() {
        if (!cartHistory.getCurrentCart().isEmpty()) {
            cartHistory.execute(CartAction.Type.CLEAR_CART, "Decommissioned all active microservices", Collections.emptyList());
        }
    }

    public synchronized boolean undoCart() {
        return cartHistory.undo();
    }

    public synchronized boolean redoCart() {
        return cartHistory.redo();
    }

    public CartHistoryManager getCartHistory() {
        return cartHistory;
    }

    // --- Knapsack Cloud FinOps Optimization ---

    public synchronized KnapsackSolver.KnapsackResult optimizeBudget(List<String> candidateIds, double budget, boolean applyToCart) {
        List<Item> candidates = new ArrayList<>();
        if (candidateIds != null && !candidateIds.isEmpty()) {
            for (String id : candidateIds) {
                Item it = catalogLookup.get(id);
                if (it != null) candidates.add(it);
            }
        } else {
            // Default: all catalog items
            candidates = catalogTree.inOrderList();
        }

        KnapsackSolver.KnapsackResult result = KnapsackSolver.solve(candidates, budget);

        if (applyToCart && !result.getSelectedItems().isEmpty()) {
            cartHistory.execute(CartAction.Type.REPLACE_CART,
                    String.format("Knapsack DP Applied (Budget: $%.0f, %d workloads)", budget, result.getSelectedItems().size()),
                    result.getSelectedItems());
        }

        return result;
    }

    // --- Physical Server Node Bin Packing ---

    public BinPackingSolver.ComparisonResult packCurrentCart(Double boxCapacity, Double customCourierFee) {
        double cap = (boxCapacity != null && boxCapacity > 0) ? boxCapacity : defaultBoxCapacity;
        double fee = (customCourierFee != null && customCourierFee >= 0) ? customCourierFee : courierFeePerBox;
        return BinPackingSolver.compareAll(cartHistory.getCurrentCart(), cap, fee);
    }

    // --- Cluster Provisioning Checkout & Huffman Compression ---

    public synchronized CheckoutResult checkoutOrder(String customerName, String organization, Double boxCapacity, Double customCourierFee) {
        List<Item> cart = cartHistory.getCurrentCart();
        double cap = (boxCapacity != null && boxCapacity > 0) ? boxCapacity : defaultBoxCapacity;
        double fee = (customCourierFee != null && customCourierFee >= 0) ? customCourierFee : courierFeePerBox;

        // Perform FFD Bin Packing for bare-metal server nodes
        BinPackingSolver.PackingResult packing = BinPackingSolver.packFFD(cart, cap, fee);

        // Generate Invoice / Manifest
        String invId = "CLOUD-FINOPS-" + (int)(100000 + Math.random() * 900000);
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        OrderInvoice invoice = new OrderInvoice(invId, customerName, organization, timestamp, cart, packing.getBoxes(), fee);

        // Compress Raw Manifest Text with Huffman Coding
        HuffmanCompressor.CompressionResult compression = HuffmanCompressor.compress(invoice.getRawInvoiceText());

        return new CheckoutResult(invoice, packing, compression);
    }

    public static class CheckoutResult {
        private OrderInvoice invoice;
        private BinPackingSolver.PackingResult packingResult;
        private HuffmanCompressor.CompressionResult compressionResult;

        public CheckoutResult(OrderInvoice invoice, BinPackingSolver.PackingResult packingResult,
                              HuffmanCompressor.CompressionResult compressionResult) {
            this.invoice = invoice;
            this.packingResult = packingResult;
            this.compressionResult = compressionResult;
        }

        public OrderInvoice getInvoice() { return invoice; }
        public BinPackingSolver.PackingResult getPackingResult() { return packingResult; }
        public HuffmanCompressor.CompressionResult getCompressionResult() { return compressionResult; }
    }

    public double getDefaultBoxCapacity() { return defaultBoxCapacity; }
    public void setDefaultBoxCapacity(double defaultBoxCapacity) { this.defaultBoxCapacity = defaultBoxCapacity; }
    public double getCourierFeePerBox() { return courierFeePerBox; }
    public void setCourierFeePerBox(double courierFeePerBox) { this.courierFeePerBox = courierFeePerBox; }
}
