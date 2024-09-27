-- Program: JBooks, an SQL based implementation used for designing a small online book store. 
-- By: Cameron Beanland.                                                                      
-- Date: September 27th, 2024.                      

-- Code was written using PostgreSQL, incase of any syntax errors prevalent. --

----- SECTION: DESIGN TABLES. -----
CREATE TABLE Books (
    book_id BIGINT PRIMARY KEY,
    book_title VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) NOT NULL,
    publish_year INT NOT NULL, 
    price DECIMAL(10, 2) NOT NULL, -- this allows for 10 digits total, and 2 decimal places (helps handle cents)
    author_id BIGINT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES Authors(author_id)
)

CREATE TABLE Authors (
    author_id BIGINT PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL, -- for the above table as well, varchar is used to store strings and 255 is the max amount of letters that can be used. 
    author_birth_year YEAR NOT NULL,
);

CREATE TABLE Genres (
    genre_id BIGINT PRIMARY KEY,
    genre_name VARCHAR(255) NOT NULL,
)

CREATE TABLE Customers ( 
    cust_id BIGINT PRIMARY KEY,
    cust_name VARCHAR(255) NOT NULL,
    cust_email VARCHAR(255) NOT NULL,
    cust_address VARCHAR(255),
)

CREATE TABLE Orders (
    order_id BIGINT PRIMARY KEY,
    cust_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (cust_id) REFERENCES Customers(cust_id),    
)


----- SECTION: ALTER TABLE, ADDS FOREIGN KEY. -----
ALTER TABLE Books ADD FOREIGN KEY (author_id) REFERENCES Authors(author_id);

----- SECTION: JUNCTION TABLES, ONE FOR DIFFERENT BOOK GENRES & KEEPING TRACK OF ORDER DETAILS. -----
CREATE TABLE BookGenres (
    book_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id)
)
-- With books having a ton of genres, and genres having a ton of books, this helps to easily manage the original book section by being able to add or remove genres from here --


CREATE TABLE OrderDeets (
    order_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price BIGINT NOT NULL,
    PRIMARY KEY (order_id, book_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
)
-- The order details table is used to track the specifics of each order, by linking orders & books together and storing specific information like quantity + price --