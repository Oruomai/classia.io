const Book = require('../models/book');
const Fuse = require('fuse.js')
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    let booksPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    books = await Book.find({}).sort({title: 1});
    let totalBooks = books.length;
  
    if (req.query.search) {
      var options = {
        threshold: 0.2,
        keys: ['title', 'author']
      }
      var fuse = new Fuse(books, options);
      books = fuse.search(req.query.search);
      books = books.map(result => result.item);
      totalBooks = books.length;
    }
  
    let totalPages = Math.ceil(totalBooks / booksPerPage);
    currentPage = currentPage > totalPages ? totalPages : currentPage;
  
    books = books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
  
    res.render('books/index', { books, totalPages, currentPage });
}
   
module.exports.renderNewForm = (req, res) => {
    res.render('books/new');
}

module.exports.renderRanking = async (req, res) => {
    let booksPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    books = await Book.find({}).sort({avgRating: -1});
    books = books.slice(0, 100);
    let totalBooks = books.length;
  
    if (req.query.search) {
      var options = {
        threshold: 0.2,
        keys: ['title', 'author']
      }
      var fuse = new Fuse(books, options);
      books = fuse.search(req.query.search);
      books = books.map(result => result.item);
      totalBooks = books.length;
    }
  
    let totalPages = Math.ceil(totalBooks / booksPerPage);
    currentPage = currentPage > totalPages ? totalPages : currentPage;
  
    books = books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
  
    res.render('books/ranking', { books, totalPages, currentPage });
}

module.exports.renderGreatestBooks = async (req, res) => {
    let booksPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    books = await Book.find({}).sort({greatestBook: 1});
    books = books.slice(0, 100);
    let totalBooks = books.length;
  
    if (req.query.search) {
      var options = {
        threshold: 0.2,
        keys: ['title', 'author']
      }
      var fuse = new Fuse(books, options);
      books = fuse.search(req.query.search);
      books = books.map(result => result.item);
      totalBooks = books.length;
    }
  
    let totalPages = Math.ceil(totalBooks / booksPerPage);
    currentPage = currentPage > totalPages ? totalPages : currentPage;
  
    books = books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
  
    res.render('books/greatestbooks', { books, totalPages, currentPage });
}


module.exports.renderNobelPrize = async (req, res) => {
    let booksPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    books = await Book.find({}).sort({nobelPrize: -1});
    books = books.slice(0, 1);
    let totalBooks = books.length;
  
    if (req.query.search) {
      var options = {
        threshold: 0.2,
        keys: ['title', 'author']
      }
      var fuse = new Fuse(books, options);
      books = fuse.search(req.query.search);
      books = books.map(result => result.item);
      totalBooks = books.length;
    }
  
    let totalPages = Math.ceil(totalBooks / booksPerPage);
    currentPage = currentPage > totalPages ? totalPages : currentPage;
  
    books = books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
  
    res.render('books/nobelprize', { books, totalPages, currentPage });
}

module.exports.renderPulitzerPrize = async (req, res) => {
    let booksPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    books = await Book.find({}).sort({pulitzerPrize: -1});
    books = books.slice(0, 16);
    let totalBooks = books.length;
  
    if (req.query.search) {
      var options = {
        threshold: 0.2,
        keys: ['title', 'author']
      }
      var fuse = new Fuse(books, options);
      books = fuse.search(req.query.search);
      books = books.map(result => result.item);
      totalBooks = books.length;
    }
  
    let totalPages = Math.ceil(totalBooks / booksPerPage);
    currentPage = currentPage > totalPages ? totalPages : currentPage;
  
    books = books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
  
    res.render('books/pulitzerprize', { books, totalPages, currentPage });
}

module.exports.createBook = async (req, res, next) => {
    const book = new Book(req.body.book);
    book.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    book.owner = req.user._id;
    await book.save();
    req.flash('success', 'Successfully made a new book!');
    res.redirect(`/books/${book._id}`)
}

module.exports.showBook = async (req, res,) => {
    const book = await Book.findById(req.params.id).populate({
        path: 'reviews',
        options: { 
            sort: { '_id': -1 } 
        }, 
        populate: {
            path: 'owner'
        }
    }).populate('owner');
    if (!book) {
        req.flash('error', 'Cannot find that book!');
        return res.redirect('/books');
    }
    let avgRating = book.calculateAvgRating();
    res.render('books/show', { book, avgRating });
}


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const book = await Book.findById(id)
    if (!book) {
        req.flash('error', 'Cannot find that book!');
        return res.redirect('/books');
    }
    res.render('books/edit', { book });
}

module.exports.updateBook = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const book = await Book.findByIdAndUpdate(id, { ...req.body.book });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    book.images.push(...imgs);
    await book.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await book.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated book!');
    res.redirect(`/books/${book._id}`)
}

module.exports.deleteBook = async (req, res) => {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted book')
    res.redirect('/books');
}