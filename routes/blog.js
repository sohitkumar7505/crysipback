import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlogLikes,
  searchBlogs,
  getBlogsByTag,
  getBlogsByAuthor,
  getBlogStats
} from '../controllers/blogcont.js';
const router = express.Router();

// Get all blogs with pagination and sorting
// GET /api/blogs?page=1&limit=10&sortBy=recent|popular
router.get('/', getAllBlogs);

// Get blog statistics
// GET /api/blogs/stats
router.get('/stats', getBlogStats);

// Search blogs
// GET /api/blogs/search?q=searchterm&page=1&limit=10
router.get('/search', searchBlogs);

// Get blogs by tag
// GET /api/blogs/tag/:tag?page=1&limit=10&sortBy=recent|popular
router.get('/tag/:tag', getBlogsByTag);

// Get blogs by author
// GET /api/blogs/author/:author?page=1&limit=10&sortBy=recent|popular
router.get('/author/:author', getBlogsByAuthor);

// Get single blog by ID
// GET /api/blogs/:id
router.get('/:id', getBlogById);

// Create new blog
// POST /api/blogs
router.post('/', createBlog);

// Update blog likes (like/unlike)
// PUT /api/blogs/:id/likes
// Body: { "action": "like" | "unlike" }
router.put('/:id/likes', updateBlogLikes);

export default router;
