const createError = require('http-errors');
const Product = require('../models/productModel');

/**
 *
 * @desc Fetch all Products
 * @route GET /api/products
 * @access public
 */
const getProducts = async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
        ? {
              name: {
                  $regex: req.query.keyword,
                  $options: 'i',
              },
          }
        : {};

    const count = await Product.countDocuments({ ...keyword });

    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.status(200).json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
    });
};

/**
 *
 * @desc Fetch single product
 * @route GET /api/products/:id
 * @access public
 */
const getProductById = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) throw createError(404, 'Product Not Found');

    res.status(200).json(product);
};

/**
 *
 * @desc Delete a product
 * @route DELETE /api/products/:id
 * @access private
 */
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.sendStatus(204);
};

/**
 *
 * @desc Create a product
 * @route POST /api/products
 * @access private
 */
const createProduct = async (req, res) => {
    const product = new Product({
        name: 'Sample name',
        price: 0,
        user: req.user.id,
        image: '/images/sample.jpg',
        brand: 'Sample brand',
        category: 'Sample category',
        countInStock: 0,
        numReviews: 0,
        description: 'Sample Description',
    });

    const createdProduct = await product.save();
    res.status(201).send(createdProduct);
};

/**
 *
 * @desc Update a product
 * @route PUT/api/products/:id
 * @access private
 */
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        price,
        description,
        image,
        brand,
        category,
        countInStock,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) throw createError(404, 'Product not found!');

    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.status(201).send(updatedProduct);
};

/**
 *
 * @desc Create new review
 * @route POST /api/products/:id/reviews
 * @access private
 */

const createReview = async (req, res) => {
    const { rating, comment } = req.body;
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) throw createError(404, 'Product not found');

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) throw createError(400, 'Product already reviewed');

    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user.id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

    await product.save();

    res.status(201).send({ message: 'Review added' });
};

/**
 *
 * @desc get top rated products
 * @route GET /api/products/top
 * @access public
 */
const getTopProducts = async (req, res) => {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);
    res.send(products);
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createReview,
    getTopProducts,
};
