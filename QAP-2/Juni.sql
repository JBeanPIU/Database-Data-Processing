-- Program: Juni, a system managing university students, profs, courses, & all enrollments 
-- By: Cameron Beanland.                                                                      
-- Date: October 16th, 2024.                      

-- Code was written using PostgreSQL, incase of any syntax errors prevalent. --

-- notes for later versions
-- A single student can register for multiple courses
-- A single professor can teach multiple courses
-- A course can only have one professor
-- A course can have multiple students

----- SECTION: DESIGN TABLES. -----
CREATE TABLE students (
student_id;
first_name;
last_name;
email;
school_enrollment_date;
)

CREATE TABLE professors (
prof_id;
first_name;
last_name;
department_name;
)

CREATE TABLE courses (
    course_id;
    course_name;
    course_description;
    prof_id;
)

CREATE TABLE enrollments (
    student_id;
    course_id;
    enrollment_date;
    -- make student_id and course_id a composite primary key* --
)
