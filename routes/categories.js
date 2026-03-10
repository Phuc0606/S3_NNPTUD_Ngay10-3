const express = require('express')
let router = express.Router()
let { GenID } = require('../utils/IDHandler')
let slugify = require('slugify')
let categorySchema = require('../schemas/categories');//DBset/DBContext
let productSchema = require('../schemas/products')


router.get('/:id', async (req, res) => {//req.params
    try {
        let dataCategories = await categorySchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!dataCategories) {
            res.status(404).send(
                { message: "ID NOT FOUND" }
            )
        } else {
            res.send(dataCategories)
        }
    } catch (error) {
        res.status(404).send(
            { message: "something went wrong" }
        )
    }
})
router.get('/', async (req, res) => {//req.params
    let dataCategories = await categorySchema.find({
        isDeleted: false
    });
    res.send(dataCategories)
})
router.get('/:id/products', async (req, res) => {//req.params
    try {
        let idCate = req.params.id;
        let category = await categorySchema.findOne({
            isDeleted: false,
            _id: idCate
        });
        if (!category) {
            return res.status(404).send({ message: "id khong hop le" });
        }
        let products = await productSchema.find({
            isDeleted: false,
            category: idCate
        }).populate('category');
        res.send(products);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})
router.post('/', async function (req, res, next) {
    try {
        // Kiem tra body da duoc parse chua (can Content-Type: application/json)
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).send({
                message: "Request body khong hop le. Kiem tra Header: Content-Type: application/json"
            });
        }
        let name = req.body.name;
        if (name != null) name = String(name).trim();
        if (!name) {
            return res.status(400).send({ message: "name khong duoc de trong va phai la chuoi" });
        }
        let newItem = new categorySchema({
            name: name.trim(),
            slug: slugify(name, {
                replacement: '-',
                lower: false,
                remove: undefined,
            }),
            image: req.body.image
        })
        await newItem.save();
        res.send(newItem)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})
router.put('/:id', async function (req, res, next) {
    try {
        // let getItem = await categorySchema.findOne({
        //     isDeleted: false,
        //     _id: req.params.id
        // });
        // if (!getItem) {
        //     res.status(404).send(
        //         { message: "ID NOT FOUND" }
        //     )
        // } else {
        //     let keys  = Object.keys(req.body);
        //     for (const key of keys) {
        //         getItem[key]=req.body[key];
        //     }
        //     await getItem.save();
        //     res.send(getItem)
        // }
        //c2
        let getItem = await categorySchema.findByIdAndUpdate(
            req.params.id, req.body, {
            new: true
        }
        )
        if (getItem) {
            res.send(getItem)
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send(
            { message: error.message }
        )
    }
})
router.delete('/:id', async function (req, res, next) {
    try {
        let getItem = await categorySchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!getItem) {
            res.status(404).send(
                { message: "ID NOT FOUND" }
            )
        } else {
            getItem.isDeleted = true
            await getItem.save();
            res.send(getItem)
        }

    } catch (error) {
        res.status(404).send(
            { message: error.message }
        )
    }
})


module.exports = router;