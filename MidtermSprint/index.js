// Program: index.js; purpose is to use async functions for a movie rental system.
// By: Cameron Beanland
// Date: November 2nd, 2024

// *a base template provided by Matthew English, some comments have been removed for clarity & have added some of my own flair *
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'jbase', 
  password: 'beans', 
  port: 5432,
});

/* ===== SECTION: DESIGN TABLES...? ===== */
async function createTable() {
  try {
    // this connects the tables to the database
    const client = await pool.connect();

    // MOVIES TABLE, spaced it out to keep everything from going off screen
    await client.query(` 
      CREATE TABLE IF NOT EXISTS Movies (
        movieId SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        releaseDate VARCHAR(4) NOT NULL,
        genre VARCHAR(25) NOT NULL,
        directorName VARCHAR(255) NOT NULL
      ); 
    `); 
    console.log('Movies table launching!');
    
    // CUSTOMERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS Customers (
        custId SERIAL PRIMARY KEY,
        firstName VARCHAR(20) NOT NULL,
        lastName VARCHAR(20) NOT NULL,
        email VARCHAR(35) UNIQUE NOT NULL,
        phoneNum TEXT UNIQUE NOT NULL
      );
    `);
    console.log('Customers table created!'); 
    
    // RENTALS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS Rentals (
        rentalId SERIAL PRIMARY KEY,
        custId INT REFERENCES Customers(custId) ON DELETE CASCADE,
        movieId INT REFERENCES Movies(movieId) ON DELETE CASCADE,
        rentDate DATE NOT NULL,
        returnDate DATE
      );
    `); // ON DELETE CASCADE gets rid of rental history if a customer or movie is deleted
    console.log('Rental table has been setup!');

    // releases client back to pool, helps for better control over connection issues
    client.release();
  } catch (error) {
    console.error('Sorry! Error while creating tables:', error);
  }
}

/* ===== SECTION: ASYNC MOVIE FUNCTIONS ===== */
/**
 * Inserts a new movie into the Movies table.
 * 
 * @param {string} title Title of the movie
 * @param {number} releaseDate Year the movie was released
 * @param {string} genre Genre of the movie
 * @param {string} directorName Director of the movie
 */
async function insertMovie(title, releaseDate, genre, directorName) {
  let query = `
    INSERT INTO Movies (title, releaseDate, genre, directorName)
    VALUES ($1, $2, $3, $4) 
  `; // VALUES placeholder string 

  const values = [title, releaseDate, genre, directorName]; // array contains actual values to insert

  try {
    // executes query with values above
    await pool.query(query, values);
    console.log('Movie has been added to table.');
  } catch (error) {
    console.error('Error! No movie for you.', error.message);
  }
}

/**
 * Prints all movies in the database to the console
 */
async function displayMovies() {
  let query = `SELECT * FROM Movies`;

  try {
    const result = await pool.query(query); 
    console.log("Available movies: " + result.rows.length); 

    result.rows.forEach(({ movieId, title, releaseDate, genre, directorName }) => {
      console.log(`ID: ${movieId}, Title: '${title}', Year: ${releaseDate}, Genre: ${genre}, Director: '${directorName}'`);
    });
  } catch (error) {
    console.error("Have we run out of movies? " + error.message);
  }
}

/**
 * Updates a customer's email address.
 * 
 * @param {number} custId ID of the customer             
 * @param {string} newEmail New email address of the customer
 */
async function updateCustomerEmail(customerId, newEmail) {
  // TODO: Add code to update a customer's email address
};

/**
 * Removes a customer from the database along with their rental history.
 * 
 * @param {number} customerId ID of the customer to remove
 */
async function removeCustomer(customerId) {
  // TODO: Add code to remove a customer and their rental history
};

/**
 * Prints a help message to the console
 */
function printHelp() {
  console.log('Usage:');
  console.log('  insert <title> <year> <genre> <director> - Insert a movie');
  console.log('  show - Show all movies');
  console.log('  update <customer_id> <new_email> - Update a customer\'s email');
  console.log('  remove <customer_id> - Remove a customer from the database');
}

/**
 * Runs our CLI app to manage the movie rentals database
 */
async function runCLI() {
  await createTable();

  const args = process.argv.slice(2);
  switch (args[0]) {
    case 'insert':
      if (args.length !== 5) {
        printHelp();
        return;
      }
      await insertMovie(args[1], parseInt(args[2]), args[3], args[4]);
      break;
    case 'show':
      await displayMovies();
      break;
    case 'update':
      if (args.length !== 3) {
        printHelp();
        return;
      }
      await updateCustomerEmail(parseInt(args[1]), args[2]);
      break;
    case 'remove':
      if (args.length !== 2) {
        printHelp();
        return;
      }
      await removeCustomer(parseInt(args[1]));
      break;
    default:
      printHelp();
      break;
  }
};

runCLI();