import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends
    maxlength: 100 // Maximum length for the heading
  },
  madeBy: {
    type: String, // Can be changed to ObjectId referencing a User model
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 50 // Minimum content length
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // Cannot be changed after creation
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0 // Cannot be negative
  },
  tags: {
    type: [String], // Array of strings for tags/categories
    default: []
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add text index for search functionality
blogSchema.index({ heading: 'text', body: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;