const User = require('../models/user');
const Filter = require('bad-words');
const badWords = require('../public/javascripts/badwords');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        if (username.length < 6) {
            req.flash('error', 'Username must be at least 6 characters long.');
            return res.redirect('register');
        }
        if (username.length > 20) {
            req.flash('error', 'Username cannot be more than 20 characters long.');
            return res.redirect('register');
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            req.flash('error', 'Username may only contain letters, numbers, and underscores');
            return res.redirect('register');
        }
        const filter = new Filter();
        const cleanUsername = filter.clean(username);
        if (cleanUsername !== username) {
            req.flash('error', 'Username contains inappropriate language and cannot be used.');
            return res.redirect('register');
        }
        const isBadWord = (username) => {
            const badWordsRegex = new RegExp(badWords, "i");
            return badWordsRegex.test(username);
        };
        if (isBadWord(username)) {
            req.flash('error', 'Username contains inappropriate language and cannot be used.');
            return res.redirect('register');
        }
        if (password.length < 8) {
            req.flash('error', 'Password must be at least 8 characters long.');
            return res.redirect('register');
        }
        if (password.length > 32) {
            req.flash('error', 'Password cannot be more than 32 characters long.');
            return res.redirect('register');
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d|.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]*$/
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must contain at least one letter and one number or special character.');
            return res.redirect('register');
        }
        const user = new User({ email, username });
        user.username = username.toLowerCase();
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Classia!');
            res.redirect('/books');
        })
        
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}



module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/books';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) { 
        return next(err);
        }
        req.flash('success', "Goodbye!");
        res.redirect('/books');
    });
}

