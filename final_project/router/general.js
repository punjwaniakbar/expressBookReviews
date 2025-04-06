const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
   // Filter the users array for any user with the same username
   let userswithsamename = users.filter((user) => {
       return user.username === username;
   });
   // Return true if any user with the same username is found, otherwise false
   if (userswithsamename.length > 0) {
       return true;
   } else {
       return false;
   }
}
// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
 });

// // Get the book list available in the shop
// public_users.get('/',function (req, res) {
//     // Send JSON response with formatted books data
//     res.send(JSON.stringify(books,null,4));
// });
/************** USING AXIOS ASYNC AWAIT *******************/
function getBooks() {
    return new Promise((resolve, reject) => {
        // Simulate async data fetching
        setTimeout(() => {
            resolve(books); // Resolve with the book list
        }, 1000); // Simulated delay
    });
}

// Get the book list available in the shop using Async-Await
public_users.get('/', async function (req, res) {
    try {
        const booksAsyn = await getBooks(); // Wait for the books to be fetched
        // Send JSON response with formatted books data
        res.send(JSON.stringify(booksAsyn, null, 4));
    } catch (error) {
        // Handle any errors that occur during the async operation
        res.status(500).send({ error: "An error occurred while fetching books." });
    }
});

// // Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//   //Write your code here
//     // Retrieve the isbn parameter from the request URL and send the corresponding books's details
//     const isbn = req.params.isbn;
//     res.send(books[isbn]);
//  });
/************** USING PROMISE CALLBACKS *******************/
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Simulate a Promise for fetching the book details based on ISBN
    const getBookByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error('Book not found'));
            }
        });
    };

    getBookByISBN(isbn)
        .then(bookDetails => {
            res.send(JSON.stringify(bookDetails, null, 4));
        })
        .catch(error => {
            res.status(404).send({ error: error.message });
        });
});
  
// // Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   //Write your code here
//     const author = req.params.author;
//     const matchingBooks = Object.entries(books)
//         .filter(([key, book]) => book.author === author)
//         .reduce((acc, [key, book]) => {
//             acc[key] = book; // Construct the result object with ID as key
//             return acc;
//         }, {});
//     res.send(JSON.stringify(matchingBooks,null,4));
// });
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        // Simulate fetching books from a database (asynchronously)
        const booksAsync = await getBooks(); // Assuming this is an asynchronous function

        // Find matching books by author
        const matchingBooks = Object.entries(booksAsync)
            .filter(([key, book]) => book.author.toLowerCase() === author.toLowerCase())
            .reduce((acc, [key, book]) => {
                acc[key] = book; // Construct the result object with ISBN as key
                return acc;
            }, {});

        // Check if any books were found
        if (Object.keys(matchingBooks).length > 0) {
            res.send(JSON.stringify(matchingBooks, null, 4));
        } else {
            res.status(404).send({ error: 'No books found for the specified author.' });
        }
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching books.' });
    }
});

// // Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   //Write your code here
//   const title = req.params.title;
//   const matchingBooks = Object.entries(books)
//       .filter(([key, book]) => book.title === title)
//       .reduce((acc, [key, book]) => {
//           acc[key] = book; // Construct the result object with ID as key
//           return acc;
//       }, {});
//   res.send(JSON.stringify(matchingBooks,null,4));
// });
/************** USING PROMISE CALLBACKS *******************/
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    // Simulate fetching books from a database (asynchronously)
    getBooks() // Assuming this returns a Promise
        .then(booksAsync => {
            // Find matching books by title
            const matchingBooks = Object.entries(booksAsync)
                .filter(([key, book]) => book.title.toLowerCase() === title.toLowerCase())
                .reduce((acc, [key, book]) => {
                    acc[key] = book; // Construct the result object with ISBN as key
                    return acc;
                }, {});

            // Check if any books were found
            if (Object.keys(matchingBooks).length > 0) {
                res.send(JSON.stringify(matchingBooks, null, 4));
            } else {
                res.status(404).send({ error: 'No books found with the specified title.' });
            }
        })
        .catch(error => {
            res.status(500).send({ error: 'An error occurred while fetching books.' });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
    // Retrieve the isbn parameter from the request URL and send the corresponding books's details
    const isbn = req.params.isbn;    
    res.send({isbn: isbn,reviews: books[isbn].reviews});
});

module.exports.general = public_users;
