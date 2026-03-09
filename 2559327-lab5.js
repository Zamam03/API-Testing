const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [];

const isValidBook = (book) => {
    return book && 
           typeof book.id === 'string' && 
           typeof book.title === 'string' &&
           book.id.trim() !== '' && 
           book.title.trim() !== '';
};

const isValidDetail = (detail) => {
    return detail && 
           typeof detail.id === 'string' &&
           typeof detail.author === 'string' &&
           typeof detail.genre === 'string' &&
           typeof detail.publicationYear === 'number' &&
           detail.id.trim() !== '' &&
           detail.author.trim() !== '' &&
           detail.genre.trim() !== '' &&
           detail.publicationYear >= 0;
};

app.get('/whoami', (req, res) => {
    res.json({ studentNumber: "2559327" });
});

app.get('/books', (req, res) => {
    res.json(books);
});

app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    
    res.json(book);
});

app.post('/books', (req, res) => {
    const newBook = req.body;
    
    if (!isValidBook(newBook)) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (books.find(b => b.id === newBook.id)) {
        return res.status(400).json({ error: "Book with this ID already exists" });
    }
    
    if (!Array.isArray(newBook.details)) {
        newBook.details = [];
    }
    
    if (newBook.details.length > 0) {
        for (const detail of newBook.details) {
            if (!isValidDetail(detail)) {
                return res.status(400).json({ error: "Invalid detail format" });
            }
        }
    }
    
    books.push(newBook);
    res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ error: "Book not found" });
    }
    
    const updates = req.body;
    
    if (updates.title !== undefined) {
        if (typeof updates.title !== 'string' || updates.title.trim() === '') {
            return res.status(400).json({ error: "Invalid title" });
        }
        books[bookIndex].title = updates.title;
    }
    
    if (updates.details !== undefined) {
        if (!Array.isArray(updates.details)) {
            return res.status(400).json({ error: "Details must be an array" });
        }
        
        for (const detail of updates.details) {
            if (!isValidDetail(detail)) {
                return res.status(400).json({ error: "Invalid detail format" });
            }
        }
        books[bookIndex].details = updates.details;
    }
    
    res.json(books[bookIndex]);
});

app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ error: "Book not found" });
    }
    
    books.splice(bookIndex, 1);
    res.status(204).send();
});

app.post('/books/:id/details', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    
    const newDetail = req.body;
    
    if (!isValidDetail(newDetail)) {
        return res.status(400).json({ error: "Missing or invalid detail fields" });
    }
    
    if (book.details.find(d => d.id === newDetail.id)) {
        return res.status(400).json({ error: "Detail with this ID already exists for this book" });
    }
    
    book.details.push(newDetail);
    res.status(201).json(book);
});

app.delete('/books/:id/details/:detailId', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    
    const detailIndex = book.details.findIndex(d => d.id === req.params.detailId);
    
    if (detailIndex === -1) {
        return res.status(404).json({ error: "Detail not found" });
    }
    
    book.details.splice(detailIndex, 1);
    res.status(204).send();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = app;
