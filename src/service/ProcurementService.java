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
            addItemToCatalog(new Item("F01", "Ultra-Low Latency Order Matcher", "Trading Engines", 650.0, 99, 28.0,
                    "C++ kernel-bypass order matching core processing Level-3 market depth with deterministic sub-microsecond tick execution."));
            addItemToCatalog(new Item("F02", "FIX Protocol Gateway Bridge", "Trading Engines", 380.0, 92, 12.0,
                    "Institutional trading connector managing standardized FIX protocol sessions, heartbeat monitoring, and drop-copy routing."));
            addItemToCatalog(new Item("F03", "Market Data WebSocket Feed", "Trading Engines", 290.0, 88, 8.0,
                    "High-concurrency streaming fanout engine distributing live order book quotes to tens of thousands of active trading clients."));

            // 2. AI & LLMs (3 items)
            addItemToCatalog(new Item("F04", "Llama-3 8B Quantized Inference Pod", "AI & LLMs", 540.0, 97, 24.0,
                    "Hardware-accelerated transformer model inference serving contextual enterprise chat, code completion, and summarization."));
            addItemToCatalog(new Item("F05", "LangChain RAG Vector Embeddings DB", "AI & LLMs", 360.0, 90, 16.0,
                    "High-dimensional vector similarity search database indexing corporate knowledge bases with cosine distance pruning."));
            addItemToCatalog(new Item("F06", "Whisper Speech Transcription Worker", "AI & LLMs", 220.0, 84, 10.0,
                    "Asynchronous audio processing queue converting call recordings and voice queries into timestamped text transcripts."));

            // 3. Risk & Ledger (3 items)
            addItemToCatalog(new Item("F07", "Distributed Double-Entry Ledger", "Risk & Ledger", 410.0, 95, 16.0,
                    "Cryptographically verified immutable accounting ledger recording multi-currency balance transitions with ACID compliance."));
            addItemToCatalog(new Item("F08", "Real-Time Risk Calculation Daemon", "Risk & Ledger", 470.0, 96, 20.0,
                    "Streaming Value-at-Risk (VaR) calculation engine monitoring margin requirements and exposure limits across portfolios."));
            addItemToCatalog(new Item("F09", "KYC & Anti-Money Laundering Pod", "Risk & Ledger", 260.0, 86, 8.0,
                    "Automated compliance screener evaluating transaction counterparties against global sanctions registries in real time."));

            // 4. Databases & In-Memory (3 items)
            addItemToCatalog(new Item("F10", "TimescaleDB Financial Time-Series", "Databases", 330.0, 91, 14.0,
                    "PostgreSQL extension optimized for fast ingest of millions of financial market ticks and automated hypertable compression."));
            addItemToCatalog(new Item("F11", "Aerospike Ultra-Fast NoSQL Cluster", "Databases", 490.0, 94, 22.0,
                    "Hybrid memory architecture NoSQL database providing predictable sub-millisecond read/write access for real-time risk state."));
            addItemToCatalog(new Item("F12", "Cassandra Write-Heavy Audit Store", "Databases", 380.0, 89, 16.0,
                    "Masterless partitioned key-space store built for high-throughput write-heavy regulatory trading activity archives."));

            // 5. Edge & Networking (2 items)
            addItemToCatalog(new Item("F13", "Envoy Global Service Mesh Proxy", "Edge & Network", 190.0, 87, 6.0,
                    "High-performance L7 communication proxy providing mutual TLS (mTLS), circuit breaking, and distributed tracing."));
            addItemToCatalog(new Item("F14", "BGP Anycast Edge Route Optimizer", "Edge & Network", 240.0, 85, 4.0,
                    "Global border gateway protocol routing daemon optimizing network paths to financial exchange co-location facilities."));

            // 6. Compliance & Vault (2 items)
            addItemToCatalog(new Item("F15", "Hardware Security Module (HSM) Pod", "Security & Vault", 520.0, 98, 8.0,
                    "FIPS 140-2 Level 3 certified cryptographic key protection engine performing digital signatures on high-value settlements."));
            addItemToCatalog(new Item("F16", "PCI-DSS Continuous Audit Collector", "Security & Vault", 180.0, 82, 4.0,
                    "Automated infrastructure scanner ensuring payment card compliance, network segmentation, and access policy auditing."));

            // 7. Notification & Delivery (3 items)
            addItemToCatalog(new Item("F17", "High-Throughput Push Notification Worker", "Async Workers", 140.0, 78, 4.0,
                    "Scalable WebSocket and APNS dispatcher delivering sub-second price alerts and execution notifications to active mobile devices."));
            addItemToCatalog(new Item("F18", "SMS & Multi-Channel Alert Dispatcher", "Async Workers", 120.0, 76, 3.0,
                    "Automated carrier gateway orchestrating transactional two-factor verification codes and urgent margin call alerts."));
            addItemToCatalog(new Item("F19", "Automated Billing & FinOps Collector", "Async Workers", 160.0, 81, 5.0,
                    "Background worker aggregating hourly cluster resource usage, calculating spot instance savings, and generating billing manifests."));

            // 8. Heavy Institutional FinOps & Cloud Workloads
            addItemToCatalog(new Item("F20", "FPGA Accelerated Co-Location Gateway", "Trading Engines", 3800.0, 100, 32.0,
                    "Ultra-low latency FPGA PCIe card deployed at exchange co-location facilities processing tick-to-trade in under 120 nanoseconds."));
            addItemToCatalog(new Item("F21", "Institutional Tier-1 Liquidity Core", "Trading Engines", 2800.0, 99, 44.0,
                    "Smart order routing (SOR) core streaming live market depth across 40+ ECNs, dark pools, and multi-asset electronic venues."));
            addItemToCatalog(new Item("F22", "Distributed GPU Monte Carlo Risk Engine", "Risk & Ledger", 2500.0, 98, 56.0,
                    "CUDA-accelerated parallel Monte Carlo simulation grid running 500M portfolio stress scenarios per minute for intraday margin checks."));
            addItemToCatalog(new Item("F23", "Multi-Cloud SWIFT Clearinghouse Node", "Risk & Ledger", 2100.0, 97, 28.0,
                    "ISO 20022 compliant interbank messaging core with end-to-end hardware encryption and real-time gross settlement (RTGS) reconciliation."));
            addItemToCatalog(new Item("F24", "Enterprise Quantum-Resistant Vault", "Security & Vault", 1900.0, 98, 16.0,
                    "Post-quantum Kyber/Dilithium cryptographic key storage securing institutional multi-sig treasury wallets."));
            addItemToCatalog(new Item("F25", "Deep Learning Alpha Signal Generator", "AI & LLMs", 2200.0, 96, 40.0,
                    "Recurrent transformer neural network ingesting alternative feeds, satellite telemetry, and sentiment signals for predictive alpha generation."));
            addItemToCatalog(new Item("F26", "Aerospike Multi-Region Enterprise Cluster", "Databases", 1800.0, 95, 36.0,
                    "Cross-datacenter replication (XDR) NoSQL cluster providing sub-millisecond writes for active high-frequency order book positions."));
            addItemToCatalog(new Item("F27", "Distributed Global Market Replay Engine", "Databases", 1600.0, 93, 32.0,
                    "Time-travel market simulation cluster replaying nanosecond-resolution order books for quantitative algorithmic backtesting."));
        } else {
            // Preset 1 (Default): Enterprise Kubernetes Microservices & APIs
            // 1. Databases (3 items)
            addItemToCatalog(new Item("K01", "PostgreSQL High-Availability Cluster", "Databases", 340.0, 95, 16.0,
                    "Primary transactional SQL database with automated multi-AZ replication, connection pooling, and sub-millisecond recovery."));
            addItemToCatalog(new Item("K02", "MongoDB Sharded Replica Set", "Databases", 280.0, 89, 12.0,
                    "Distributed NoSQL document database configured with 3-node replica sets for flexible schema storage and high read concurrency."));
            addItemToCatalog(new Item("K03", "Redis Distributed Cache Cluster", "Databases", 140.0, 82, 8.0,
                    "In-memory key-value data store providing sub-millisecond session caching, pub/sub channels, and atomic rate limiter counters."));

            // 2. APIs & Gateways (3 items)
            addItemToCatalog(new Item("K04", "Kong Enterprise API Gateway", "APIs & Gateways", 190.0, 92, 6.0,
                    "Cloud-native reverse proxy handling traffic routing, dynamic TLS termination, automated rate-limiting, and consumer authentication."));
            addItemToCatalog(new Item("K05", "OAuth2 JWT Identity Microservice", "APIs & Gateways", 110.0, 86, 4.0,
                    "Centralized zero-trust authentication service handling token minting, RBAC authorization claims, and SSO federated login."));
            addItemToCatalog(new Item("K06", "GraphQL Federation Mesh Router", "APIs & Gateways", 150.0, 88, 5.0,
                    "Unified declarative API gateway composing distributed subgraphs into a unified endpoint with automated query plan caching."));

            // 3. Messaging & Streaming (3 items)
            addItemToCatalog(new Item("K07", "Apache Kafka 3-Node Event Broker", "Messaging", 420.0, 96, 20.0,
                    "High-throughput fault-tolerant distributed streaming platform processing 500,000+ events/sec across persistent partitioned commit logs."));
            addItemToCatalog(new Item("K08", "RabbitMQ Distributed Task Queue", "Messaging", 160.0, 84, 6.0,
                    "AMQP message broker ensuring reliable asynchronous background task scheduling with dead-letter exchange handling."));
            addItemToCatalog(new Item("K09", "NATS JetStream Telemetry Broker", "Messaging", 120.0, 78, 4.0,
                    "Ultra-lightweight cloud event streaming engine providing sub-millisecond pub/sub messaging for distributed IoT and edge agents."));

            // 4. AI & Analytics (3 items)
            addItemToCatalog(new Item("K10", "Real-Time Fraud Detection Engine", "AI & Analytics", 480.0, 98, 24.0,
                    "Low-latency streaming machine learning pipeline evaluating financial transaction anomalies against behavioral scoring models under 5ms."));
            addItemToCatalog(new Item("K11", "Apache Spark Analytics Worker Pod", "AI & Analytics", 320.0, 87, 16.0,
                    "Distributed big data processing pod executing distributed parallel batch transformations and iterative matrix calculations."));
            addItemToCatalog(new Item("K12", "TensorFlow Serving Prediction API", "AI & Analytics", 390.0, 91, 18.0,
                    "High-concurrency deep learning inference service optimized with TensorRT GPU acceleration and dynamic request batching."));

            // 5. Observability & Logs (3 items)
            addItemToCatalog(new Item("K13", "Elasticsearch Search & Index Pod", "Observability", 290.0, 88, 14.0,
                    "Distributed Lucene-powered search engine providing full-text search, distributed indexing, and real-time log ingestion."));
            addItemToCatalog(new Item("K14", "Prometheus Metrics Time-Series DB", "Observability", 180.0, 85, 8.0,
                    "High-frequency time-series scrape collector recording multi-dimensional metrics with PromQL alerting rules."));
            addItemToCatalog(new Item("K15", "Grafana Dashboard & Alerting Pod", "Observability", 85.0, 74, 2.0,
                    "Interactive cloud visualization server rendering real-time operational telemetry and automated PagerDuty alert triggers."));

            // 6. Security & Storage (3 items)
            addItemToCatalog(new Item("K16", "HashiCorp Vault Secrets Cluster", "Security", 210.0, 94, 6.0,
                    "Zero-trust cryptographic secrets management engine providing automated cloud credential rotation, KMS encryption, and audit tracing."));
            addItemToCatalog(new Item("K17", "MinIO Distributed S3 Object Store", "Security", 260.0, 89, 12.0,
                    "High-performance S3-compatible cloud object storage cluster optimized for unstructured data lakes, media assets, and backups."));
            addItemToCatalog(new Item("K18", "WAF Cloudflare Ingress Controller", "Security", 95.0, 80, 3.0,
                    "Edge DDoS mitigation and Layer-7 Web Application Firewall shielding internal service mesh pods from malicious exploit payloads."));

            // 7. DevOps & CI/CD (3 items)
            addItemToCatalog(new Item("K19", "ArgoCD GitOps Deployment Daemon", "DevOps & CI/CD", 130.0, 83, 4.0,
                    "Declarative continuous delivery controller reconciling desired Git state against live Kubernetes cluster deployments."));
            addItemToCatalog(new Item("K20", "SonarQube Static Code Analyzer", "DevOps & CI/CD", 160.0, 79, 6.0,
                    "Automated code quality and security vulnerability gate analyzing code smells, coverage regressions, and OWASP compliance."));
            addItemToCatalog(new Item("K21", "Docker Registry Private Cache", "DevOps & CI/CD", 90.0, 72, 4.0,
                    "Geo-replicated container image caching mirror reducing node pull latencies and upstream Docker Hub throttling limits."));

            // 8. Heavy Enterprise Cloud & AI Infrastructure (High-Capacity FinOps Tier)
            addItemToCatalog(new Item("K22", "NVIDIA H100 8-GPU Distributed Training Pod", "AI & Analytics", 3400.0, 99, 56.0,
                    "Enterprise hardware-accelerated transformer model training cluster with NVLink 900 GB/s inter-GPU fabric and FP8 tensor execution."));
            addItemToCatalog(new Item("K23", "Multi-Region CockroachDB Global Cluster", "Databases", 2600.0, 99, 48.0,
                    "Distributed geo-replicated SQL database providing serializable ACID transactions, Raft consensus, and zero-downtime multi-cloud survivability."));
            addItemToCatalog(new Item("K24", "Confluent Enterprise Multi-Zone Kafka Hub", "Messaging", 2250.0, 98, 40.0,
                    "Enterprise event streaming backbone with Tiered Storage, multi-datacenter cluster linking, and 24/7 SLA partition balancing."));
            addItemToCatalog(new Item("K25", "vLLM High-Throughput Inference Cluster", "AI & Analytics", 2100.0, 97, 44.0,
                    "Distributed PagedAttention LLM inference serving engine hosting 70B parameter models with dynamic continuous request batching."));
            addItemToCatalog(new Item("K26", "Snowflake Iceberg Managed Lakehouse Engine", "Databases", 1950.0, 96, 36.0,
                    "Serverless columnar analytical query engine operating over Apache Iceberg open table formats on high-throughput object storage."));
            addItemToCatalog(new Item("K27", "Dedicated Hardware Security Module (HSM) Vault", "Security", 1850.0, 98, 16.0,
                    "FIPS 140-2 Level 3 certified cryptographic key protection engine with tamper-evident zero-trust hardware boundaries."));
            addItemToCatalog(new Item("K28", "Cloudflare Magic WAN Enterprise Transit Hub", "APIs & Gateways", 1750.0, 96, 24.0,
                    "Global Layer-3/4 Anycast interconnect providing DDoS mitigation, dynamic multi-cloud route optimization, and private WAN links."));
            addItemToCatalog(new Item("K29", "ScyllaDB Enterprise Low-Latency Ring", "Databases", 1650.0, 95, 36.0,
                    "C++ re-write of Cassandra utilizing seastar asynchronous architecture to process millions of IOPS with sub-millisecond P99 latency."));
            addItemToCatalog(new Item("K30", "HA Kubernetes Dedicated Control Plane", "DevOps & CI/CD", 1550.0, 99, 28.0,
                    "Triple-redundant etcd quorum and Kubernetes API server farm with automated snapshots and leader-election health loops."));
            addItemToCatalog(new Item("K31", "ClickHouse Real-Time OLAP Analytics Node", "Observability", 1450.0, 94, 32.0,
                    "Column-oriented DBMS designed for blazingly fast SQL analytics queries over petabyte-scale application log streams."));
            addItemToCatalog(new Item("K32", "Ray Distributed AI Orchestrator Node", "AI & Analytics", 1450.0, 94, 30.0,
                    "Unified compute framework for scaling Python-based machine learning pipelines, multi-node hyperparameter tuning, and model checkpoints."));
            addItemToCatalog(new Item("K33", "Apache Flink Distributed State Processor", "Messaging", 1400.0, 93, 28.0,
                    "Event-driven stream analytics engine with RocksDB state backend processing sliding window aggregations at multi-gigabit throughput."));
            addItemToCatalog(new Item("K34", "Palo Alto Prisma SASE Zero-Trust Gateway", "Security", 1350.0, 92, 24.0,
                    "Enterprise cloud-native secure access service edge combining SD-WAN with continuous authentication and threat prevention."));
            addItemToCatalog(new Item("K35", "GitLab Dedicated Enterprise CI Runner Farm", "DevOps & CI/CD", 1250.0, 91, 32.0,
                    "Autoscaling container build farm with local caching proxies, Docker-in-Docker daemons, and automated artifact validation."));
            addItemToCatalog(new Item("K36", "Datadog Enterprise Unified Telemetry Aggregator", "Observability", 1150.0, 92, 20.0,
                    "Unified multi-cloud telemetry pipeline ingesting distributed traces, APM metrics, continuous profiling, and synthetic monitors."));
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
