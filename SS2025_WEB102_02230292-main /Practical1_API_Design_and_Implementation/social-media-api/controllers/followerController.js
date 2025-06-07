const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { followers, users } = require('../utils/mockData');

// @desc    Get all followers
// @route   GET /api/followers
// @access  Public
exports.getFollowers = asyncHandler(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = followers.length;

    // Get paginated results
    const results = followers.slice(startIndex, endIndex);

    // Enhance followers with user data
    const enhancedResults = results.map(follower => {
        const user = users.find(user => user.id === follower.user_id);
        const followedUser = users.find(user => user.id === follower.followed_user_id);
        return {
            ...follower,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                profile_picture: user.profile_picture
            },
            followed_user: {
                id: followedUser.id,
                username: followedUser.username,
                full_name: followedUser.full_name,
                profile_picture: followedUser.profile_picture
            }
        };
    });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: enhancedResults.length,
        page,
        total_pages: Math.ceil(total / limit),
        pagination,
        data: enhancedResults
    });
});

// @desc    Get single follower
// @route   GET /api/followers/:id
// @access  Public
exports.getFollower = asyncHandler(async (req, res, next) => {
    const follower = followers.find(follower => follower.id === req.params.id);

    if (!follower) {
        return next(
            new ErrorResponse(`Follower not found with id of ${req.params.id}`, 404)
        );
    }

    // Enhance follower with user data
    const user = users.find(user => user.id === follower.user_id);
    const followedUser = users.find(user => user.id === follower.followed_user_id);
    const enhancedFollower = {
        ...follower,
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            profile_picture: user.profile_picture
        },
        followed_user: {
            id: followedUser.id,
            username: followedUser.username,
            full_name: followedUser.full_name,
            profile_picture: followedUser.profile_picture
        }
    };

    res.status(200).json({
        success: true,
        data: enhancedFollower
    });
});

// @desc    Create new follower
// @route   POST /api/followers
// @access  Private (we'll simulate this)
exports.createFollower = asyncHandler(async (req, res, next) => {
    // Simulate authentication
    const userId = req.header('X-User-Id');
    if (!userId) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    const user = users.find(user => user.id === userId);
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const followedUser = users.find(user => user.id === req.body.followed_user_id);
    if (!followedUser) {
        return next(new ErrorResponse('Followed user not found', 404));
    }

    const newFollower = {
        id: (followers.length + 1).toString(),
        user_id: userId,
        followed_user_id: req.body.followed_user_id,
        created_at: new Date().toISOString().slice(0, 10)
    };

    followers.push(newFollower);

    res.status(201).json({
        success: true,
        data: newFollower
    });
});

// @desc    Update follower
// @route   PUT /api/followers/:id
// @access  Private (we'll simulate this)
exports.updateFollower = asyncHandler(async (req, res, next) => {
    // Simulate authentication
    const userId = req.header('X-User-Id');
    if (!userId) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    let follower = followers.find(follower => follower.id === req.params.id);

    if (!follower) {
        return next(
            new ErrorResponse(`Follower not found with id of ${req.params.id}`, 404)
        );
    }

    // Check if user owns the follower
    if (follower.user_id !== userId) {
        return next(new ErrorResponse('Not authorized to update this follower', 401));
    }

    // Update follower
    const index = followers.findIndex(follower => follower.id === req.params.id);
    followers[index] = {
        ...follower,
        ...req.body,
        id: follower.id, // Ensure ID doesn't change
        user_id: follower.user_id // Ensure user_id doesn't change
    };

    res.status(200).json({
        success: true,
        data: followers[index]
    });
});

// @desc    Delete follower
// @route   DELETE /api/followers/:id
// @access  Private (we'll simulate this)
exports.deleteFollower = asyncHandler(async (req, res, next) => {
    // Simulate authentication
    const userId = req.header('X-User-Id');
    if (!userId) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    const follower = followers.find(follower => follower.id === req.params.id);

    if (!follower) {
        return next(
            new ErrorResponse(`Follower not found with id of ${req.params.id}`, 404)
        );
    }

    // Check if user owns the follower
    if (follower.user_id !== userId) {
        return next(new ErrorResponse('Not authorized to delete this follower', 401));
    }

    // Delete follower
    const index = followers.findIndex(follower => follower.id === req.params.id);
    followers.splice(index, 1);

    res.status(200).json({
        success: true,
        data: {}
    });
});