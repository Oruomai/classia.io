const express = require('express');
const router = express.Router();
const books = require('../controllers/books');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isOwner, validateBook, isAdmin } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Book = require('../models/book');

router.route('/')
    .get(catchAsync(books.index))
    .post(isLoggedIn, isAdmin, upload.array('image'), validateBook, catchAsync(books.createBook))

router.get('/new', isLoggedIn, isAdmin, books.renderNewForm)

router.route('/:id')
    .get(catchAsync(books.showBook))
    .put(isLoggedIn, isAdmin, upload.array('image'), validateBook, catchAsync(books.updateBook))
    .delete(isLoggedIn, isAdmin, catchAsync(books.deleteBook));

router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(books.renderEditForm))

module.exports = router;