const express = require('express');
const router = express.Router();
const User = require('../schemas/users');

// POST /enable - body: { email, username } -> status = true
router.post('/enable', async (req, res) => {
    try {
        const { email, username } = req.body || {};
        if (!email || !username) {
            return res.status(400).send({
                message: 'Cần truyền email và username'
            });
        }
        const user = await User.findOne({
            isDeleted: false,
            email: String(email).trim(),
            username: String(username).trim()
        });
        if (!user) {
            return res.status(404).send({
                message: 'Không tìm thấy user với email và username tương ứng'
            });
        }
        user.status = true;
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST /disable - body: { email, username } -> status = false
router.post('/disable', async (req, res) => {
    try {
        const { email, username } = req.body || {};
        if (!email || !username) {
            return res.status(400).send({
                message: 'Cần truyền email và username'
            });
        }
        const user = await User.findOne({
            isDeleted: false,
            email: String(email).trim(),
            username: String(username).trim()
        });
        if (!user) {
            return res.status(404).send({
                message: 'Không tìm thấy user với email và username tương ứng'
            });
        }
        user.status = false;
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET all users (chưa xóa), query ?username=... (includes)
router.get('/', async (req, res) => {
    try {
        const filter = { isDeleted: false };
        const usernameQuery = req.query.username;
        if (usernameQuery != null && String(usernameQuery).trim() !== '') {
            filter.username = { $regex: String(usernameQuery).trim(), $options: 'i' };
        }
        const users = await User.find(filter).populate('role');
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({
            isDeleted: false,
            _id: req.params.id
        }).populate('role');
        if (!user) {
            return res.status(404).send({ message: 'ID NOT FOUND' });
        }
        res.send(user);
    } catch (error) {
        res.status(404).send({ message: 'something went wrong' });
    }
});

// POST create user
router.post('/', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).send({
                message: 'Request body không hợp lệ. Content-Type: application/json'
            });
        }
        const { username, password, email, fullName, avatarUrl, role } = req.body;
        if (!username || !password || !email) {
            return res.status(400).send({
                message: 'username, password và email là bắt buộc'
            });
        }
        const newUser = new User({
            username: String(username).trim(),
            password: String(password),
            email: String(email).trim(),
            fullName: fullName != null ? String(fullName) : '',
            avatarUrl: avatarUrl != null ? String(avatarUrl) : 'https://i.sstatic.net/l60Hf.png',
            role: role || undefined
        });
        await newUser.save();
        const saved = await User.findById(newUser._id).populate('role');
        res.send(saved);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// PUT update user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ isDeleted: false, _id: req.params.id });
        if (!user) {
            return res.status(404).send({ message: 'ID NOT FOUND' });
        }
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('role');
        res.send(updated);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// DELETE user (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!user) {
            return res.status(404).send({ message: 'ID NOT FOUND' });
        }
        user.isDeleted = true;
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
