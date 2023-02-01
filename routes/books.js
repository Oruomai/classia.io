const express = require('express');
const router = express.Router();
const books = require('../controllers/books');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isOwner, validateBook } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Book = require('../models/book');

router.route('/')
    .get(catchAsync(books.index))
    .post(isLoggedIn, upload.array('image'), validateBook, catchAsync(books.createBook))

router.get('/new', isLoggedIn, books.renderNewForm)

router.route('/:id')
    .get(catchAsync(books.showBook))
    .put(isLoggedIn, isOwner, upload.array('image'), validateBook, catchAsync(books.updateBook))
    .delete(isLoggedIn, isOwner, catchAsync(books.deleteBook));

router.get('/:id/edit', isLoggedIn, catchAsync(books.renderEditForm))

module.exports = router;