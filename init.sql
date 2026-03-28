CREATE TABLE movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    release_date DATE NOT NULL,
    rating REAL NOT NULL,
    duration INTEGER NOT NULL,
    description TEXT NOT NULL,
    filename TEXT NOT NULL,
    poster_url TEXT
);
