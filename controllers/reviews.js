const Book = require('../models/book');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const book = await Book.findById(req.params.id).populate('reviews').exec();
    let haveReviewed = book.reviews.filter(review => {
        return review.owner.equals(req.user._id);
    }).length;
    // check if haveReviewed is 0 (false) or 1 (true)
    if(haveReviewed) {
        // flash an error and redirect back to post
        req.flash("error", "You have already submitted a review for this book.");
        res.redirect(`/books/${book._id}`);
        return;
    }
    const review = new Review(req.body.review);
    review.owner = req.user._id;
    book.reviews.push(review);
    await review.save();
    await book.save();
    req.flash('success', 'Successfully created review!');
    res.redirect(`/books/${book._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Book.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/books/${id}`);
}