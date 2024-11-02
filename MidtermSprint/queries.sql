-- Program: index.js; purpose is to use async functions for a movie rental system. 
-- By: Cameron Beanland
-- Date: November 2nd, 2024

-- This is a PostgreSQL database showcasing table insertion and performing queries, and will also include how tables are in 3NF --
----------------------------------------------------------------------------------------------------------------------------------
    MOVIES / 5 movie options
    -----------------------------------------------
    INSERT INTO Movies(movieId, title, releaseDate, genre, directorName); -- all movies (except for one) that i unfortunately watched as a kid
    VALUES (1, 'Bee Movie', 2007, 'Family/Comedy', 'Steve Hickner'), (2, 'Shark Tale', 2004, 'Family/Adventure', 'Vicky Jenson'),
           (3, 'A Minecraft Movie', 2025, 'Adventure/Action', 'Jared Hess'), (4, 'The Emoji Movie', 2017, 'Family/Comedy', 'Tony Leondis'),
           (5, 'Foodfight!', 2012, 'Family/Comedy', 'Lawrence Kasanoff');

    CUSTOMERS / 5 customer candidates
    -----------------------------------------------
    INSERT INTO Customers(custId, firstName, lastName, email, phoneNum); -- none of these people are real
    VALUES (1, 'John', 'Dis', 'JohnDis@gmail.com', '709-727-1804'), (2, 'Daus', 'Boschitt', 'dausboschitt@yahoo.ca', '709-649-1223')
           (3, 'Bameron', 'Ceanland', 'bameron_c@msn.ca', '709-649-2421'), (4, 'Tomtor', 'Wise', 'tomtoriswise@hotmail.com', '709-727-3927')
           (5, 'Mack', 'Donald', 'mackdonalds@outlook.ca', '709-649-2810')

    RENTALS / 10 rentals
    -----------------------------------------------
    INSERT INTO Rentals(custId, movieId, rentDate, returnDate); -- 10 random rentals provided below
    VALUES (1, 5, '2024-02-30', '2024-03-06'), (2, 4, '2024-03-07', '2024-03-14'), 
           (3, 3, '2024-02-23', '2024-02-30'), (4, 2, '2024-02-30', '2024-03-06'),
           (5, 1, '2024-03-07', '2024-03-14'), (1, 1, '2024-03-21', '2024-03-28'),
           (2, 2, '2024-04-03', '2024-04-10'), (3, 3, '2024-04-20', '2024-04-27'),
           (4, 4, '2024-05-01', '2024-05-07'), (5, 5, '2024-05-08', '2024-05-15')


-- Provide PostgreSQL queries to solve the following: --
--------------------------------------------------------
    -- 1. Find all movies rented by a specific customer, given their email.
    SELECT customer.email, rental.movieId, rental.rentDate, rental.returnDate
    FROM Rentals AS rentals
    JOIN Customers AS customer ON rental.custId = customer.custId
    WHERE customer.email = 'JohnDis@gmail.com';

    -- 2. Given a movie title, list all customers who have rented the movie
    SELECT customer.custId, customer.firstName, customer lastName
    FROM rentals AS rental
    JOIN Customers AS customer ON rental.custId = customer.custId
    JOIN Movies AS movie ON rental.movie = movie.movieId
    WHERE movie.title = 'Bee Movie';

    -- 3. Get the rental history for a specific movie title
    SELECT movies.title, rentals.rentDate, rentals.returnDate
    FROM Rentals AS rentals
    JOIN Movies AS movies ON rentals.movieId = movies.movieId
    WHERE movies.title = 'Bee Movie';

    -- 4. For a specific movie director; 
    --    find name of customer, date of rental & title of movie, each time a movie by that director was rented
    SELECT customers.firstName, customers.lastName, rentals.rentDate, movies.title
    FROM Rentals AS rentals
    JOIN Customers AS customers ON rentals.custId = customers.custId
    JOIN Movies AS movies ON rentals.movieId = movies.movieId
    WHERE movies.directorName = 'Steve Hickner';

    -- 5. List all currently rented out movies (movies who's return dates haven't been met)
    SELECT movies.title, rentals.rentDate, rentals.returnDate
    FROM Rentals AS rentals
    JOIN Movies AS movies ON rentals.movieId = movies.movieId
    WHERE rentals.returnDate < CURRENT_DATE;


-- Explain how the tables (created using the previous queries) are each in 3NF --
---------------------------------------------------------------------------------
/* The following three tables are all in 3NF due to the fact that each table has a primary key. In this case, it's 'custId', 'movieId', and 'rentId',
   plus each non-pk column are all fully dependant on the pk. 

   i.e: in Movies, (title, releaseDate, genre, and directorName) ALL depend on movieId.

   Due to having no partial dependancies, these tables are in 2NF, which is requirement for 3NF. The second is that there are no transitive
   dependancies. This means that no non-pk attribute depends on another non-pk attribute.
