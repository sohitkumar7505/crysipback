import Blog from "../models/blog.js";
import mongoose from 'mongoose';
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 10, 1);

    let sortCriteria;
    switch (sortBy) {
      case 'popular':
        sortCriteria = { upvotes: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortCriteria = { createdAt: -1, upvotes: -1 };
        break;
    }

    const blogs = await Blog.find({ isPublished: true })
      .select('heading madeBy body createdAt upvotes tags')
      .sort(sortCriteria)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const totalBlogs = await Blog.countDocuments({ isPublished: true });
    const totalPages = Math.ceil(totalBlogs / limitNum);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalBlogs,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// Get a single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await Blog.findOne({ _id: id, isPublished: true }).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found or not published'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};


// Create a new blog
export const createBlog = async (req, res) => {
  try {
    const { heading, madeBy, body, tags, isPublished = false } = req.body;

    // Validation
    if (!heading || !madeBy || !body) {
      return res.status(400).json({
        success: false,
        message: 'Heading, madeBy, and body are required fields'
      });
    }

    if (body.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Blog body must be at least 50 characters long'
      });
    }

    const newBlog = new Blog({
      heading: heading.trim(),
      madeBy: madeBy.trim(),
      body: body.trim(),
      tags: tags || [],
      isPublished
    });

    const savedBlog = await newBlog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: savedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
};

// Update blog upvotes (like/unlike functionality)
export const updateBlogLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    if (!action || !['like', 'unlike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "like" or "unlike"'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (!blog.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Cannot like unpublished blog'
      });
    }

    // Update upvotes based on action
    if (action === 'like') {
      blog.upvotes += 1;
    } else if (action === 'unlike' && blog.upvotes > 0) {
      blog.upvotes -= 1;
    }

    const updatedBlog = await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog ${action}d successfully`,
      data: {
        id: updatedBlog._id,
        upvotes: updatedBlog.upvotes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blog likes',
      error: error.message
    });
  }
};

// Search blogs by text (uses the text index)
export const searchBlogs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const blogs = await Blog.find({
      $text: { $search: q },
      isPublished: true
    })
      .select('heading madeBy body createdAt upvotes tags')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalBlogs = await Blog.countDocuments({
      $text: { $search: q },
      isPublished: true
    });

    const totalPages = Math.ceil(totalBlogs / limit);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        searchQuery: q,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBlogs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching blogs',
      error: error.message
    });
  }
};

// Get blogs by tag
export const getBlogsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    let sortCriteria;
    
    switch (sortBy) {
      case 'popular':
        sortCriteria = { upvotes: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortCriteria = { createdAt: -1, upvotes: -1 };
        break;
    }

    const blogs = await Blog.find({
      tags: { $in: [tag] },
      isPublished: true
    })
      .select('heading madeBy body createdAt upvotes tags')
      .sort(sortCriteria)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalBlogs = await Blog.countDocuments({
      tags: { $in: [tag] },
      isPublished: true
    });

    const totalPages = Math.ceil(totalBlogs / limit);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        tag,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBlogs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs by tag',
      error: error.message
    });
  }
};

// Get blogs by author
export const getBlogsByAuthor = async (req, res) => {
  try {
    const { author } = req.params;
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    let sortCriteria;
    
    switch (sortBy) {
      case 'popular':
        sortCriteria = { upvotes: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortCriteria = { createdAt: -1, upvotes: -1 };
        break;
    }

    const blogs = await Blog.find({
      madeBy: { $regex: new RegExp(author, 'i') }, // Case-insensitive search
      isPublished: true
    })
      .select('heading madeBy body createdAt upvotes tags')
      .sort(sortCriteria)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalBlogs = await Blog.countDocuments({
      madeBy: { $regex: new RegExp(author, 'i') },
      isPublished: true
    });

    const totalPages = Math.ceil(totalBlogs / limit);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        author,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBlogs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs by author',
      error: error.message
    });
  }
};

// Get blog statistics
export const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({ isPublished: true });
    const totalUpvotes = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, total: { $sum: '$upvotes' } } }
    ]);

    const mostLikedBlog = await Blog.findOne({ isPublished: true })
      .sort({ upvotes: -1 })
      .select('heading upvotes madeBy')
      .lean();

    const recentBlog = await Blog.findOne({ isPublished: true })
      .sort({ createdAt: -1 })
      .select('heading createdAt madeBy')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalBlogs,
        totalUpvotes: totalUpvotes[0]?.total || 0,
        mostLikedBlog,
        recentBlog
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog statistics',
      error: error.message
    });
  }
};