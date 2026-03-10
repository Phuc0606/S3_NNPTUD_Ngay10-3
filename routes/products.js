const express = require('express')
let router = express.Router()
let slugify = require('slugify')
let productSchema = require('../schemas/products')

// GET all products
router.get('/', async (req, res) => {
    try {
        let dataProducts = await productSchema.find({
            isDeleted: false
        }).populate('category');
        res.send(dataProducts)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// GET product by ID
router.get('/:id', async (req, res) => {
    try {
        let product = await productSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        }).populate('category');
        
        if (!product) {
            res.status(404).send({ message: "ID NOT FOUND" })
        } else {
            res.send(product)
        }
    } catch (error) {
        res.status(404).send({ message: "something went wrong" })
    }
})

// POST create new product
router.post('/', async (req, res) => {
    try {
        let newProduct = new productSchema({
            title: req.body.title,
            slug: slugify(req.body.title, {
                replacement: '-',
                lower: true,
                remove: undefined,
            }),
            price: req.body.price,
            description: req.body.description,
            images: req.body.images,
            category: req.body.category
        })
        await newProduct.save();
        res.send(newProduct)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        let getProduct = await productSchema.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate('category');
        
        if (getProduct) {
            res.send(getProduct)
        } else {
            res.status(404).send({ message: "ID NOT FOUND" })
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

// DELETE product (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        let getProduct = await productSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        
        if (!getProduct) {
            res.status(404).send({ message: "ID NOT FOUND" })
        } else {
            getProduct.isDeleted = true
            await getProduct.save();
            res.send(getProduct)
        }
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
})

module.exports = router;