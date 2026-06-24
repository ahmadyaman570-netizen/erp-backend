const { Op } = require("sequelize");
const { Product, Category, Inventory, Warehouse } = require("../models");

const calcPrices = (data) => {
    const base = Number(data.priceBeforeTax || data.salePrice || 0);
    const discountPercent = Number(data.discountPercent || 0);
    const taxPercent = Number(data.taxPercent || 0);
    const discountAmount = base * discountPercent / 100;
    const afterDiscount = base - discountAmount;
    const taxAmount = afterDiscount * taxPercent / 100;
    return {
        priceBeforeTax: base,
        priceAfterTax: Number(data.priceAfterTax || (afterDiscount + taxAmount)),
        salePrice: Number(data.salePrice || (afterDiscount + taxAmount)),
        discountPercent,
        taxPercent
    };
};

const createProduct = async (data) => {
    const category = await Category.findByPk(data.categoryId);
    if (!category) throw new Error("Category not found");

    const skuExists = await Product.findOne({ where: { sku: data.sku } });
    if (skuExists) throw new Error("SKU already exists");

    if (data.isbn) {
        const isbnExists = await Product.findOne({ where: { isbn: data.isbn } });
        if (isbnExists) throw new Error("ISBN already exists");
    }

    const prices = calcPrices(data);
    const product = await Product.create({
        name: data.name,
        nameEn: data.nameEn || null,
        sku: data.sku,
        isbn: data.isbn || null,
        barcode: data.barcode || null,
        unit: data.unit || "قطعة",
        productType: data.productType || "STOCK",
        isActive: data.isActive ?? true,
        costPrice: Number(data.costPrice || 0),
        ...prices,
        categoryId: data.categoryId
    });

    if (Array.isArray(data.initialStocks)) {
        for (const stock of data.initialStocks) {
            if (!stock.warehouseId || Number(stock.quantity || 0) < 0) continue;
            const warehouse = await Warehouse.findByPk(stock.warehouseId);
            if (!warehouse) continue;
            await Inventory.findOrCreate({
                where: { productId: product.id, warehouseId: Number(stock.warehouseId) },
                defaults: { quantity: Number(stock.quantity || 0) }
            });
        }
    }
    return await getProductById(product.id);
};

const getProducts = async ({ search = "", page = 1, limit = 100 }) => {
    const offset = (page - 1) * limit;
    const where = {};
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { sku: { [Op.like]: `%${search}%` } },
            { isbn: { [Op.like]: `%${search}%` } },
            { barcode: { [Op.like]: `%${search}%` } }
        ];
    }
    const { rows, count } = await Product.findAndCountAll({
        where,
        include: [
            { model: Category, attributes: ["id", "name", "code", "parentId"] },
            { model: Inventory, attributes: ["id", "quantity", "warehouseId"], include: [{ model: Warehouse, attributes: ["id", "name", "location"] }] }
        ],
        limit: Number(limit), offset: Number(offset), order: [["createdAt", "DESC"]], distinct: true
    });
    const products = rows.map((product) => {
        const json = product.toJSON();
        const inventoryRows = json.Inventories || json.inventories || [];
        const totalQuantity = inventoryRows.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        return { ...json, totalQuantity };
    });
    return { products, totalProducts: count, currentPage: Number(page), totalPages: Math.ceil(count / limit) };
};

const getProductById = async (id) => {
    const product = await Product.findByPk(id, { include: [{ model: Category, attributes: ["id", "name", "code", "parentId"] }, { model: Inventory, attributes: ["id", "quantity", "warehouseId"], include: [{ model: Warehouse, attributes: ["id", "name", "location"] }] }] });
    if (!product) throw new Error("Product not found");
    const json = product.toJSON();
    const inventoryRows = json.Inventories || json.inventories || [];
    const totalQuantity = inventoryRows.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    return { ...json, totalQuantity };
};

const updateProduct = async (id, data) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found");
    if (data.categoryId) {
        const category = await Category.findByPk(data.categoryId);
        if (!category) throw new Error("Category not found");
    }
    if (data.sku && data.sku !== product.sku) {
        const exists = await Product.findOne({ where: { sku: data.sku } });
        if (exists) throw new Error("SKU already exists");
    }
    if (data.isbn && data.isbn !== product.isbn) {
        const exists = await Product.findOne({ where: { isbn: data.isbn } });
        if (exists) throw new Error("ISBN already exists");
    }
    const prices = calcPrices({ ...product.toJSON(), ...data });
    await product.update({
        name: data.name ?? product.name,
        nameEn: data.nameEn ?? product.nameEn,
        sku: data.sku ?? product.sku,
        isbn: data.isbn ?? product.isbn,
        barcode: data.barcode ?? product.barcode,
        costPrice: data.costPrice ?? product.costPrice,
        unit: data.unit ?? product.unit,
        productType: data.productType ?? product.productType,
        isActive: data.isActive ?? product.isActive,
        ...prices,
        categoryId: data.categoryId ?? product.categoryId
    });
    return await getProductById(id);
};

const deleteProduct = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found");
    const inventoryCount = await Inventory.count({ where: { productId: id } });
    if (inventoryCount > 0) throw new Error("Cannot delete product because it has inventory records");
    await product.destroy();
    return { message: "Product deleted successfully" };
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
