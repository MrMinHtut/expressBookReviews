const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
    try {
        const getBooks = new Promise((resolve, reject) => {
            resolve(books);
        });

        const booksList = await getBooks;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        const getBookByISBN = new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        });

        const book = await getBookByISBN;
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        const getBooksByAuthor = new Promise((resolve, reject) => {
            const booksByAuthor = [];
            for (let isbn in books) {
                if (books[isbn].author === author) {
                    booksByAuthor.push({ isbn: isbn, ...books[isbn] });
                }
            }
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject("No books found by this author");
            }
        });

        const booksList = await getBooksByAuthor;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;

        const getBooksByTitle = new Promise((resolve, reject) => {
            const booksByTitle = [];
            for (let isbn in books) {
                if (books[isbn].title === title) {
                    booksByTitle.push({ isbn: isbn, ...books[isbn] });
                }
            }
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject("No books found with this title");
            }
        });

        const booksList = await getBooksByTitle;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
