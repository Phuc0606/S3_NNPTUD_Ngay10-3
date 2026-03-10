const express = require('express');
const router = express.Router();
const Role = require('../schemas/roles');

// GET all roles (chưa xóa)
router.get('/', async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false });
        res.send(roles);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET all users có role = :id  --> /roles/:id/users (phải định nghĩa trước /:id)
router.get('/:id/users', async (req, res) => {
    try {
        const User = require('../schemas/users');
        const roleId = req.params.id;
        const role = await Role.findOne({ isDeleted: false, _id: roleId });
        if (!role) {
            return res.status(404).send({ message: 'Role ID không tồn tại' });
        }
        const users = await User.find({
            isDeleted: false,
            role: roleId
        }).populate('role');
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET role by ID
router.get('/:id', async (req, res) => {
    try {
        const role = await Role.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!role) {
            return res.status(404).send({ message: 'ID NOT FOUND' });
        }
        res.send(role);
    } catch (error) {
        res.status(404).send({ message: 'something went wrong' });
    }
});

// POST create role
router.post('/', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).send({
                message: 'Request body không hợp lệ. Content-Type: application/json'
            });
        }
        const name = req.body.name != null ? String(req.body.name).trim() : '';
        if (!name) {
            return res.status(400).send({ message: 'name không được để trống' });
        }
        const newRole = new Role({
            name,
            description: req.body.description != null ? req.body.description : ''
        });
        await newRole.save();
        res.send(newRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// PUT update role
router.put('/:id', async (req, res) => {
    try {
        const role = await Role.findOne({ isDeleted: false, _id: req.params.id });
        if (!role) {
            return res.status(404).send({ message: 'ID NOT FOUND' });
        }
        const updated = await Role.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.send(updated);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// DELETE role (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const role = await Role.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!role) {
            return res.status(404).send({ message: 'ID NOT FOUND' });
        }
        role.isDeleted = true;
        await role.save();
        res.send(role);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
