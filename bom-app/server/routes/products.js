const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
    const products = await Product.getRootProducts()
        .populate('children', 'name description level childrenCount');

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
}));

router.get('/all', asyncHandler(async (req, res) => {
    const products = await Product.find({})
        .populate('children', 'name description level')
        .populate('parentId', 'name level')
        .sort({ level: 1, name: 1 });

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
}));

router.get('/search', asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Arama terimi gereklidir'
        });
    }

    const products = await Product.searchProducts(q.trim())
        .populate('children', 'name description level')
        .populate('parentId', 'name level');

    res.status(200).json({
        success: true,
        count: products.length,
        searchTerm: q.trim(),
        data: products
    });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('children', 'name description level childrenCount')
        .populate('parentId', 'name level');

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Ürün bulunamadı'
        });
    }

    res.status(200).json({
        success: true,
        data: product
    });
}));

router.get('/:id/children', asyncHandler(async (req, res) => {
    const parentId = req.params.id;

    const parent = await Product.findById(parentId);
    if (!parent) {
        return res.status(404).json({
            success: false,
            error: 'Ana ürün bulunamadı'
        });
    }

    const children = await Product.getChildrenByParentId(parentId)
        .populate('children', 'name description level childrenCount');

    res.status(200).json({
        success: true,
        parentProduct: {
            id: parent._id,
            name: parent.name,
            level: parent.level
        },
        count: children.length,
        data: children
    });
}));

router.post('/', asyncHandler(async (req, res) => {
    const { name, description, parentId } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Ürün adı zorunludur'
        });
    }

    if (parentId) {
        const parent = await Product.findById(parentId);
        if (!parent) {
            return res.status(404).json({
                success: false,
                error: 'Ana ürün bulunamadı'
            });
        }
    }

    const product = await Product.create({
        name: name.trim(),
        description: description ? description.trim() : undefined,
        parentId: parentId || null
    });

    if (parentId) {
        await Product.findByIdAndUpdate(
            parentId,
            { $addToSet: { children: product._id } }
        );
    }

    const populatedProduct = await Product.findById(product._id)
        .populate('parentId', 'name level');

    res.status(201).json({
        success: true,
        message: 'Ürün başarıyla oluşturuldu',
        data: populatedProduct
    });
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Ürün bulunamadı'
        });
    }

    const updateData = {};
    if (name && name.trim().length > 0) {
        updateData.name = name.trim();
    }
    if (description !== undefined) {
        updateData.description = description ? description.trim() : '';
    }

    product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).populate('parentId', 'name level').populate('children', 'name description level');

    res.status(200).json({
        success: true,
        message: 'Ürün başarıyla güncellendi',
        data: product
    });
}));

router.put('/:id/move', asyncHandler(async (req, res) => {
    const { newParentId } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Ürün bulunamadı'
        });
    }

    if (newParentId) {
        const newParent = await Product.findById(newParentId);
        if (!newParent) {
            return res.status(404).json({
                success: false,
                error: 'Hedef ana ürün bulunamadı'
            });
        }

        const isDescendant = await checkIfDescendant(productId, newParentId);
        if (isDescendant) {
            return res.status(400).json({
                success: false,
                error: 'Ürün kendi alt ürününe taşınamaz'
            });
        }
    }

    if (product.parentId) {
        await Product.findByIdAndUpdate(
            product.parentId,
            { $pull: { children: productId } }
        );
    }

    if (newParentId) {
        await Product.findByIdAndUpdate(
            newParentId,
            { $addToSet: { children: productId } }
        );

        const newParent = await Product.findById(newParentId);
        product.level = newParent.level + 1;
    } else {
        product.level = 0;
    }

    product.parentId = newParentId || null;
    await product.save();

    await updateChildrenLevels(productId, product.level);

    const updatedProduct = await Product.findById(productId)
        .populate('parentId', 'name level')
        .populate('children', 'name description level');

    res.status(200).json({
        success: true,
        message: 'Ürün başarıyla taşındı',
        data: updatedProduct
    });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Ürün bulunamadı'
        });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Ürün başarıyla silindi',
        data: {
            id: req.params.id,
            name: product.name
        }
    });
}));

async function checkIfDescendant(ancestorId, descendantId) {
    if (ancestorId === descendantId) {
        return true;
    }

    const descendants = await Product.find({ parentId: ancestorId });

    for (const descendant of descendants) {
        if (descendant._id.toString() === descendantId) {
            return true;
        }

        const isNestedDescendant = await checkIfDescendant(descendant._id.toString(), descendantId);
        if (isNestedDescendant) {
            return true;
        }
    }

    return false;
}

async function updateChildrenLevels(parentId, parentLevel) {
    const children = await Product.find({ parentId });

    for (const child of children) {
        child.level = parentLevel + 1;
        await child.save();

        await updateChildrenLevels(child._id, child.level);
    }
}

module.exports = router;