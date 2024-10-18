-- Program: Juni, a system managing university students, profs, courses, & all enrollments. 
-- By: Cameron Beanland.                                                                      
-- Date: October 18th, 2024.                      


-- Code was written using PostgreSQL, incase of any syntax errors prevalent. --


----- SECTION: DESIGN TABLES, used to visualize database tables. -----
CREATE TABLE students (
student_id BIGINT PRIMARY KEY, -- used for unique or specific values/numbers
first_name VARCHAR(255) NOT NULL, -- varchar is used to store strings and 255 is the max amount of letters that can be used.
last_name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
school_enrollment_date DATE NOT NULL, -- used to configure start date of program
)

CREATE TABLE professors (
prof_id BIGINT PRIMARY KEY, 
first_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL,
department_name VARCHAR(255) NOT NULL,
)

CREATE TABLE courses (
    course_id BIGINT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_description VARCHAR(255) NOT NULL,
    prof_id BIGINT REFERENCES professors(prof_id), -- prof_id required for courses
)

CREATE TABLE enrollments (
    student_id BIGINT, 
    course_id BIGINT, 
    enrollment_date DATE NOT NULL, 
    PRIMARY KEY (student_id, course_id), 
    FOREIGN KEY (student_id) REFERENCES students(student_id), -- FK (foreign key) referencing to students table
    FOREIGN KEY (course_id) REFERENCES courses(course_id) -- FK referencing to courses table
);


----- SECTION: DATA INSERTION, section revolved around inputting sample data from tables above. -----
INSERT INTO students (student_id, first_name, last_name, email, school_enrollment_date) -- contains the info (in order of what's inside bracket) for the students
VALUES                                                                  
    (1, 'Buck', 'Tee', 'dundas.street123@sweeterman.com', '2022-05-17'),
    (2, 'Swain', 'Twanson', 'swain.da.rock@johnson.com', '1949-01-20'),
    (3, 'Jonathan', 'Beanland', 'jbeanpiu@noobmail.com', '2001-07-26'),
    (4, 'Toby', 'Fox', 'undertalegame@gmail.com', '1991-10-11'),
    (5, 'Imuh', 'Noght-Kreatif', 'thisonesucks@weball.com', '2000-02-22');

INSERT INTO professors (prof_id, first_name, last_name, department_name) -- contains all professor information in order
VALUES
    (1, 'Gordon', 'Ramsay', 'Cooking'),
    (2, 'Matthew', 'Lillard', 'Baking'),
    (3, 'Maurice', 'Babin', 'Software Development'),
    (4, 'Gojo', 'Satoru', 'Jujutsu');

INSERT INTO courses (course_id, course_name, course_description, prof_id) -- course info
VALUES
    (1, 'Hells Kitchen 101', 'Intro to Cooking', 1),
    (2, 'Software Development 101', 'Intro to Software Dev', 2),
    (3, 'Jujutsu 101', 'Intro to Curses', 3);

INSERT INTO enrollments (student_id, course_id, enrollment_date) -- hellish with poor reading comprehension, just shows student enrollments and who goes where based on values
VALUES
    (1, 1, '2023-09-01'), -- Buck Tee enrolling into Hells Kitchen 101 (poor soul)
    (2, 2, '2023-09-02'), -- Swain Twanson strolls on in to SD 101 
    (3, 2, '2023-09-03'), -- Jonathan Beanland also enters SD 101
    (4, 3, '2023-09-04'), -- Toby Fox is forced into Jujutsu 101 
    (5, 1, '2023-09-05'); -- Imuh Noght-Kreatif enrolls in Hells Kitchen 101 (why)   


----- SECTION: QUERIES, time for testing baby -----
-- 1st attempt is to retrieve names of those enrolled in Hells Kitchen 101, should be Buck Tee & Imuh Noght-Kreatif
SELECT CONCAT(first_name, ' ', last_name) AS full_name
FROM students
JOIN enrollments ON students.student_id = enrollments.student_id
JOIN courses on enrollments.course_id = courses.course_id
WHERE courses.course_name = 'Hells Kitchen 101' -- im keeping it now but realized too late this was supposed to be Physics 101 LOL

-- 2nd run is retrieving a list of courses, alongside the prof's full name & who teaches what
SELECT courses.course_name, CONCAT(professors.first_name, ' ', professors.last_name) AS prof_name
FROM courses
JOIN professors ON courses.prof_id = professors.prof_id;

-- 3rd and last query, used to retrieve course data that students have enrolled in
SELECT DISTINCT courses.course_name
FROM courses
JOIN enrollments ON courses.course_id = enrollments.course_id;


----- SECTION: DATA UPDATE/DELETION, combining both for a bit less code (lazy), but one is to update an email address, the other removes a student from a course in order
UPDATE students
SET email = 'jbeanpiu@godmail.com' -- from lvl 1 to 100
WHERE student_id = 3;

DELETE FROM enrollments
WHERE student_id = 5 AND course_id = 1; -- was banned during the first class, donkey

