-- Updated script to include bcrypt hashing example and instructions

-- Create an admin user
-- Run this script to create a default admin account

-- Note: Replace the email and password with your desired credentials
-- The password 'Admin@123' should be hashed using bcrypt before inserting

-- Example bcrypt hashing in Node.js:
-- const bcrypt = require('bcrypt');
-- const hashedPassword = await bcrypt.hash('Admin@123', 10);
-- console.log(hashedPassword);

-- Insert the hashed password below
INSERT INTO users (username, email, password, role, created_at, updated_at)
VALUES ('admin', 'rajasreekathuroju@gmail.com', '$2b$10$kUijUde29YBfHksd2JyQf.1y2oDbLWulnOi7LHMA2NuwQ2Ec6/RCC', 'admin', NOW(), NOW());