CREATE DATABASE IF NOT EXISTS petclinic;
--  GRANT ALL PRIVILEGES ON petclinic.* TO pc@localhost IDENTIFIED BY 'pc';

USE petclinic;

CREATE TABLE IF NOT EXISTS rooms (
  id INT(4) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(30),
  room_type VARCHAR(30),
  last_used TIMESTAMP,
  INDEX(room_name)
) engine=InnoDB;
