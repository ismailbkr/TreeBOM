const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ürün adı zorunludur'],
        trim: true,
        maxlength: [100, 'Ürün adı en fazla 100 karakter olabilir']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Açıklama en fazla 500 karakter olabilir']
    },

    // null ise kök ürün
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },

    // Alt ürünlerin ID'leri
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    // Hiyerarşi seviyesi (performans için)
    level: {
        type: Number,
        default: 0,
        min: 0
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Arama indeksi - Hem ürün adı hem açıklama için
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ parentId: 1 });

// Virtual fields
productSchema.virtual('childrenCount').get(function () {
    return this.children ? this.children.length : 0;
});

productSchema.virtual('isRoot').get(function () {
    return !this.parentId;
});

// Middleware: Otomatik seviye hesaplama
productSchema.pre('save', async function (next) {
    if (this.parentId && this.isModified('parentId')) {
        try {
            const parent = await this.constructor.findById(this.parentId);
            if (parent) {
                this.level = parent.level + 1;
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Middleware: Silme öncesi temizlik
productSchema.pre('findOneAndDelete', async function (next) {
    try {
        const product = await this.model.findOne(this.getQuery());

        if (product) {
            // Alt ürünleri kök seviyeye taşı
            await this.model.updateMany(
                { parentId: product._id },
                { $set: { parentId: null, level: 0 } }
            );

            // Parent'tan kendini kaldır
            if (product.parentId) {
                await this.model.findByIdAndUpdate(
                    product.parentId,
                    { $pull: { children: product._id } }
                );
            }
        }
    } catch (error) {
        return next(error);
    }
    next();
});

// Static methods
productSchema.statics.getRootProducts = function () {
    return this.find({ parentId: null }).sort({ name: 1 });
};

productSchema.statics.getChildrenByParentId = function (parentId) {
    return this.find({ parentId }).sort({ name: 1 });
};

productSchema.statics.searchProducts = function (searchText) {
    // Ürün adı ve açıklamasında arama yap
    return this.find(
        { $text: { $search: searchText } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
};

// Instance methods
productSchema.methods.addChild = async function (childId) {
    if (!this.children.includes(childId)) {
        this.children.push(childId);
        await this.save();

        await this.constructor.findByIdAndUpdate(
            childId,
            {
                parentId: this._id,
                level: this.level + 1
            }
        );
    }
};

productSchema.methods.removeChild = async function (childId) {
    this.children.pull(childId);
    await this.save();

    await this.constructor.findByIdAndUpdate(
        childId,
        {
            parentId: null,
            level: 0
        }
    );
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 