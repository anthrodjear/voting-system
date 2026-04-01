UPDATE voters SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$HO8xsauxWngkH+RbkS/iIw$8uD7+KDYUHM30ufSHQa/G6xHCePmnjfRFc03KlyikH4' WHERE national_id = '12345678';
UPDATE super_admins SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$HO8xsauxWngkH+RbkS/iIw$8uD7+KDYUHM30ufSHQa/G6xHCePmnjfRFc03KlyikH4' WHERE email = 'admin@iebc.go.ke';
UPDATE returning_officers SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$HO8xsauxWngkH+RbkS/iIw$8uD7+KDYUHM30ufSHQa/G6xHCePmnjfRFc03KlyikH4' WHERE email = 'ro@iebc.go.ke';
