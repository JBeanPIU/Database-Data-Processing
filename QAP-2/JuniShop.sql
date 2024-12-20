-- Program: JuniShop, an online store inventory & orders system management program.
-- By: Cameron Beanland.                                                                      
-- Date: October 18th, 2024.                      


-- Code was written using PostgreSQL, incase of any syntax errors prevalent. --


----- SECTION: DESIGN TABLES, used to visualize database tables. -----
CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- 2 represents decimal values for money ($10.99 = .99)
    stock_quantity INT NOT NULL -- integer reffering to quantity of products available, and how it can scale higher or lower
)

CREATE TABLE customers (
    cust_id BIGINT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE -- unique setup to prevent customers from somehow having the same email
)

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    cust_id BIGINT REFERENCES customers(cust_id), --FK (Foreign Key) references the customers table
    order_date DATE NOT NULL
)

CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, product_id), -- composite primary keys 
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
)


----- SECTION: DATA INSERTION, section revolved around inputting sample data from tables above. -----
INSERT INTO products (product_id, product_name, price, stock_quantity) VALUES
(1, 'Fumo', 149.99, 17),
(2, 'Google Pixel 9 Pro', 1,479.99, 6),
(3, 'iPad Pro Gen 2', 899.99, 9),
(4, 'Hairbrush', 11.99, 20),
(5, 'Evaporated Milk', 3.29, 50),
(6, 'Wireless Headphones', 109.99, 25);

INSERT INTO customers (cust_id, first_name, last_name, email) VALUES
(1, 'Cameron', 'Beanland', 'cambeanland1@hotmail.com'),
(2, 'Maxine', 'Campbell', 'mcampb123@gmail.com'),
(3, 'Rick', 'Grimes', 'rickgrimes@msn.ca'),
(4, 'Daryl', 'Dixon', 'daryldixon@yahoo.ca');

INSERT INTO orders (order_id, cust_id, order_date) VALUES
(1, 1, '2024-10-01'), -- order for Cameron
(2, 2, '2024-10-02'), -- order for Maxine
(3, 3, '2024-10-03'), -- order for Rick
(4, 4, '2024-10-04'), -- order for Daryl
(5, 1, '2024-10-05'); -- 2nd order for Cam

INSERT INTO order_items (order_id, product_id, quantity) VALUES
-- Cameron's first order
(1, 1, 2), -- 2 fumos
(1, 3, 1), -- 1 ipad pro gen 2

-- Maxine's order
(2, 2, 1), -- 1 google pixel pro
(2, 4, 3), -- 3 hairbrushes

-- Rick's order
(3, 5, 5), -- 5 evaporated milks (fitting)
(3, 6, 1), -- 1 wireless headphones (nvm)

-- Daryl's order
(4, 1, 1), -- 1 fumo
(4, 2, 1), -- 1 google pixel pro

-- Cameron's second order
(5, 4, 1), -- 1 hairbrush
(5, 6, 2); -- 2 wireless headphones


----- SECTION: QUERIES, time for testing baby -----
-- 1st query, simply retrieve the names & stock quantities of all products
SELECT product_name, stock_quantity
FROM products;

-- 2nd query, retrieve product names and quantities for an order placed
SELECT p.product_name, oi.quantity
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
WHERE oi.order_id = 1;

-- 3rd query, nab all orders placed by one specific customer (including ID's and quantities)
SELECT o.order_id, p.product_name, oi.quantity
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.cust_id = 1;


----- SECTION: DATA UPDATE/DELETION, same as before but update is to simulate reduction of stock quantity, and  ----- 
-----                                removal of one of the orders + all associated order items from its system. -----
UPDATE products -- based on my first order (Cameron)
SET stock_quantity = stock_quantity - oi.quantity
FROM order_items oi 
WHERE products.product_id = oi.product_id
AND oi.order_id = 1; 

-- deleting order id 2 (Maxine's order) and her items
DELETE FROM order_items WHERE order_id = 2; -- deletes associated order item
DELETE FROM orders WHERE order_id = 2; -- this then deletes the order itself

