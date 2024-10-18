-- Program: Juni, a system managing university students, profs, courses, & all enrollments 
-- By: Cameron Beanland.                                                                      
-- Date: October 17th, 2024.                      

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
    FOREIGN KEY (student_id) REFERENCES students(student_id), -- Foreign key to students table
    FOREIGN KEY (course_id) REFERENCES courses(course_id) -- Foreign key to courses table
);
