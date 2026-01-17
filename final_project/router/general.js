const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Registration failed: Username and password are required." });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: `Registration failed: Username '${username}' is already taken.` });
    }

    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User successfully registered. You can now log in." });
});

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
        const getBooks = new Promise((resolve) => {
            resolve(books);
        });

        const booksList = await getBooks;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(500).json({ message: "An internal error occurred while retrieving the book list." });
    }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const getBookByISBN = new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(`No book found with ISBN: ${isbn}`);
            }
        });

        const book = await getBookByISBN;
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const booksByAuthor = [];
            const keys = Object.keys(books);
            
            keys.forEach(isbn => {
                if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                    booksByAuthor.push({ isbn: isbn, ...books[isbn] });
                }
            });

            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject(`No books found for author: ${author}`);
            }
        });

        const booksList = await getBooksByAuthor;
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const getBooksByTitle = new Promise((resolve, reject) => {
            const booksByTitle = [];
            const keys = Object.keys(books);

            keys.forEach(isbn => {
                if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                    booksByTitle.push({ isbn: isbn, ...books[isbn] });
                }
            });

            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject(`No books found with the title: ${title}`);
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
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: `Review search failed: ISBN ${isbn} does not exist.` });
    }
});

module.exports.general = public_users;
