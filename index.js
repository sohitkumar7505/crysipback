import blogRoutes from './routes/blog.js'
import express from 'express';
import cors from 'cors';
import connectDB from './models/db.js';
import contactRoutes from './routes/contactus.js'
const app = express();
import dotenv from "dotenv";

dotenv.config();

app.use(express.json());
connectDB();
app.use(cors());
app.use('/api/blogs', blogRoutes);
app.get('/', (req, res) => {
  res.send('Hello, World! Express server with import syntax is running.');
});
app.use('/api/contact',contactRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
