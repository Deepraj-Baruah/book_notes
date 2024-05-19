import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import ejsLint from "ejs-lint";
import env from "dotenv";

const app = express();
const port = 3000;
const baseUrl = 'https://openlibrary.org';
const API_URL = "https://openlibrary.org/search.json";
let bookID;
let bookISBN;
env.config();

const db = new pg.Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function searchBook(title) {
    try {
        const response = await axios.get(`${API_URL}?title=${title}`);
        console.log(response.data.docs);
        return response.data;
    } catch (error) {
        console.error("Failed to search for book: ", error.message);
        return null;
    }
}

async function bookDetail(isbn) {
    try {
        const response = await axios.get(`http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=details`);
        if (response.data && Object.keys(response.data).length > 0) {
            const bookDetails = response.data[`ISBN:${isbn}`];
            let author = bookDetails.details.authors.map(author => author.name).join(", ");
            console.log('Title:', bookDetails.details.title);
            console.log('Authors:', author);
            console.log('Publish Date:', bookDetails.details.publish_date);
            console.log('Work:', bookDetails.details.works[0].key);
            bookID = bookDetails.details.works[0].key;
            console.log("ISBN: ", bookISBN);
            console.log('Response:', response.data);
            await db.query(
                "INSERT INTO books(title, author, isbn, publish_date) VALUES($1, $2, $3, $4);",
                [bookDetails.details.title, author, isbn, bookDetails.details.publish_date]);
        }
        return response.data;
    } catch (error) {
        console.error("Failed to fetch book details:", error.message);
        return null;
    }
}

async function getBookCover(isbn) {
    try {
        const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
        const bookData = response.data[`ISBN:${isbn}`];
        if (bookData && bookData.cover) {
            console.log("Book cover details: ", bookData.cover.medium);
            await db.query("UPDATE books SET cover_url = ($1) WHERE isbn = ($2)", [bookData.cover.medium, isbn]);
            return bookData.cover.large;
        } else {
            return 'No cover available';
        }
    } catch (error) {
        console.error('Error fetching book cover:', error.message);
        return null;
    }
}

async function getWorkDetails(work) {
    try {
        const response = await axios.get(`${baseUrl}${work}.json`);
        const workData = response.data;
        await db.query("UPDATE books SET description = ($1) WHERE isbn = ($2)", [workData.description.value, bookISBN]);
        return workData ? workData.description.value : null;
    } catch (error) {
        console.error("Failed to fetch work details:", error.message);
        return null;
    }
}

app.get("/", async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM books JOIN book_notes ON books.id = book_id');
        const bookData = result.rows;
        res.render("index.ejs", {
            bookData: bookData,
        });
    } catch (error) {
        console.error("Failed to fetch books:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/search", async (req, res) => {
    const book = req.body["bookName"];
    try {
        const bookDetail = await searchBook(book);
        const covers = await getBookCover(bookISBN);
        res.render("search.ejs", {
            books: bookDetail,
            bookCovers: covers
        });
    } catch (error) {
        console.error("Failed to search for book: ", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/book/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    bookISBN = req.params.isbn;
    try {
        const books = await bookDetail(isbn);
        const covers = await getBookCover(isbn);
        const works = await getWorkDetails(bookID);
        res.render("book.ejs", {
            books: books,
            bookCovers: covers,
            workDetails: works
        });
    } catch (error) {
        console.error("Failed to fetch book details: ", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/submit-book", async (req, res) => {
    const review = req.body.note;
    const database = await db.query("SELECT * FROM books ORDER BY id ASC;");
    const lastItemIndex = database.rows.length - 1;
    const lastItemId = database.rows[lastItemIndex].id;
    try {
        await db.query(
            "INSERT INTO book_notes (book_id, note) VALUES($1,$2)",
            [lastItemId, review]);
        res.redirect("/");
    } catch (error) {
        console.error("Failed to fetch book details: ", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/bookinfo/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const book = await db.query(
            "SELECT * FROM books JOIN book_notes ON books.id = book_id WHERE books.id = $1",
            [id]);
        if (book.rows.length === 0) {
            return res.status(404).send("Book not found");
        } else {
            res.render("bookinfo.ejs", {
                book: book.rows[0],
            });
        }
    } catch (error) {
        console.error("Failed to fetch book details: ", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const database = await db.query(
            "SELECT * FROM books JOIN book_notes ON books.id = book_id WHERE books.id = ($1)",
            [id]
        );
        if (database.rows.length === 0) {
            return res.status(404).send("Book not found");
        } else {
            console.log("Database:", database.rows[0]);
            res.render("edit.ejs", {
                bookData: database.rows[0],
            });
        }
    } catch (error) {
        console.error("Failed to fetch book details: ", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const updateReview = req.body.note;
    try {
        await db.query(
            "UPDATE book_notes SET note = $1 WHERE book_id = $2;",
            [updateReview, id]);
        res.redirect("/");
    } catch (error) {
        console.error("Failed to update book note: ", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/book/delete/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const deletedNotes = await db.query(
            "DELETE FROM book_notes WHERE book_id = ($1) RETURNING *",
            [id]
        );
        const deletedBook = await db.query(
            "DELETE FROM books WHERE books.id = ($1) RETURNING *",
            [id]
        );
        if (deletedBook.rows.length === 0) {
            return res.status(404).send("Book not deleted");
        }
        console.log("Deleted Book: ", deletedBook.rows);
        console.log("Deleted Notes: ", deletedNotes.rows);
        res.redirect("/");
    } catch (error) {
        console.error("Failed to delete book: ", error.message);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});