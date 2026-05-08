import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "neko-kart-secret-key-123";
const DATA_FILE = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function getData() {
  if (!fs.existsSync(DATA_FILE)) {
     const initialData = {
      users: [{
        id: "admin-id",
        email: "neko@gmail.com",
        password: bcrypt.hashSync("Kailash@123", 10),
        name: "Admin User",
        role: "admin",
        phone: "9876543210",
        address: "Admin Office, Neko City",
        createdAt: new Date().toISOString(),
      }],
      products: [],
      orders: [],
      tickets: [],
      categories: [
        { id: 'c1', name: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400" },
        { id: 'c2', name: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400" },
        { id: 'c3', name: "groceries", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400" },
        { id: 'c4', name: "home", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400" },
        { id: 'c5', name: "beauty", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400" }
      ],
      coupons: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

export const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
  next();
};

app.post("/api/upload", authenticateToken, upload.single("image"), (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ... (rest of the routes stay the same, but use 'app.' directly)
// Note: I will keep the routes but move them out of startServer

// Routes
app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    const db = getData();
    if (db.users.find((u: any) => u.email === email)) return res.status(400).json({ message: "User already exists" });
    const newUser = { id: Math.random().toString(36).substring(7), email, password: await bcrypt.hash(password, 10), name, role: "user", createdAt: new Date().toISOString() };
    db.users.push(newUser);
    saveData(db);
    const { password: _, ...userNoPass } = newUser;
    res.json({ token: jwt.sign(userNoPass, JWT_SECRET), user: userNoPass });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = getData();
    const user = db.users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid credentials" });
    const { password: _, ...userNoPass } = user;
    res.json({ token: jwt.sign(userNoPass, JWT_SECRET), user: userNoPass });
  });

  app.get("/api/auth/profile", authenticateToken, (req: any, res) => {
    const user = getData().users.find((u: any) => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...userNoPass } = user;
    res.json(userNoPass);
  });

  app.put("/api/auth/profile", authenticateToken, (req: any, res) => {
    const db = getData();
    const idx = db.users.findIndex((u: any) => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: "User not found" });
    db.users[idx] = { ...db.users[idx], ...req.body };
    saveData(db);
    const { password, ...userNoPass } = db.users[idx];
    res.json(userNoPass);
  });

  app.put("/api/auth/change-password", authenticateToken, async (req: any, res) => {
    const { oldPassword, newPassword } = req.body;
    const db = getData();
    const user = db.users.find((u: any) => u.id === req.user.id);
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ message: "Incorrect current password" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    saveData(db);
    res.json({ message: "Password changed successfully" });
  });

  app.patch("/api/orders/:id/edit", authenticateToken, (req: any, res) => {
    const db = getData();
    const order = db.orders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    if (order.status !== 'Processing') return res.status(400).json({ message: "Order cannot be edited now" });
    
    order.shippingDetails = { ...order.shippingDetails, ...req.body };
    saveData(db);
    res.json(order);
  });

  app.patch("/api/orders/:id/return", authenticateToken, (req: any, res) => {
    const db = getData();
    const order = db.orders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    if (order.status !== 'Delivered') return res.status(400).json({ message: "Only delivered orders can be returned" });
    
    order.status = 'Returned';
    saveData(db);
    res.json(order);
  });

  app.get("/api/products", (req, res) => {
    const { category, search } = req.query;
    let products = getData().products;
    if (category) products = products.filter((p: any) => p.category === category);
    if (search) {
      const searchStr = (search as string).toLowerCase();
      products = products.filter((p: any) => 
        (p.name?.toLowerCase() || '').includes(searchStr) || 
        (p.description?.toLowerCase() || '').includes(searchStr)
      );
    }
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = getData().products.find((p: any) => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post("/api/admin/products", authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    const newProduct = { ...req.body, id: Math.random().toString(36).substring(7) };
    db.products.push(newProduct);
    saveData(db);
    res.json(newProduct);
  });

  app.put("/api/admin/products/:id", authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    const idx = db.products.findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Product not found" });
    db.products[idx] = { ...db.products[idx], ...req.body };
    saveData(db);
    res.json(db.products[idx]);
  });

  app.delete("/api/admin/products/:id", authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    db.products = db.products.filter((p: any) => p.id !== req.params.id);
    saveData(db);
    res.json({ message: "Deleted" });
  });

  app.post("/api/orders", authenticateToken, (req: any, res) => {
    const db = getData();
    const newOrder = { ...req.body, id: "ORD-" + Math.random().toString(36).substring(2, 9).toUpperCase(), userId: req.user.id, status: "Processing", createdAt: new Date().toISOString() };
    db.orders.push(newOrder);
    saveData(db);
    res.json(newOrder);
  });

  app.get("/api/orders", authenticateToken, (req: any, res) => {
    const db = getData();
    res.json(req.user.role === 'admin' ? db.orders : db.orders.filter((o: any) => o.userId === req.user.id));
  });

  app.patch("/api/orders/:id/cancel", authenticateToken, (req: any, res) => {
    const db = getData();
    const order = db.orders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    if (order.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });
    if (order.status !== 'Processing') return res.status(400).json({ message: "Already shipped" });
    order.status = 'Cancelled';
    saveData(db);
    res.json(order);
  });

  app.patch("/api/admin/orders/:id/status", authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    const order = db.orders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    order.status = req.body.status;
    saveData(db);
    res.json(order);
  });

  app.post("/api/tickets", authenticateToken, (req: any, res) => {
    const db = getData();
    const ticket = { id: "TICK-" + Math.random().toString(36).substring(7).toUpperCase(), userId: req.user.id, userName: req.user.name, ...req.body, status: "Open", createdAt: new Date().toISOString() };
    db.tickets = db.tickets || [];
    db.tickets.push(ticket);
    saveData(db);
    res.json(ticket);
  });

  app.get("/api/tickets", authenticateToken, (req: any, res) => {
    const db = getData();
    const tkts = db.tickets || [];
    res.json(req.user.role === 'admin' ? tkts : tkts.filter((t: any) => t.userId === req.user.id));
  });

  app.get("/api/admin/analytics", authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    const revenue = db.orders.reduce((s: number, o: any) => s + (o.status !== 'Cancelled' ? o.total : 0), 0);
    res.json({ totalRevenue: revenue, totalOrders: db.orders.length, totalUsers: db.users.length, chartData: [] });
  });

  app.get("/api/categories", (req, res) => res.json(getData().categories));

  app.post("/api/admin/categories", authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    const newCat = { ...req.body, id: Math.random().toString(36).substring(7) };
    db.categories.push(newCat);
    saveData(db);
    res.json(newCat);
  });

  app.delete("/api/admin/categories/:id", authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    db.categories = db.categories.filter((c: any) => c.id !== req.params.id);
    saveData(db);
    res.json({ message: "Deleted" });
  });

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL && !process.env.NETLIFY) {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
} else if (!process.env.VERCEL && !process.env.NETLIFY) {
  const dist = path.join(process.cwd(), "dist");
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

if (!process.env.VERCEL && !process.env.NETLIFY && import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, "0.0.0.0", () => console.log(`Server at ${PORT}`));
}
