/*const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};

(async () => {
    const hashedPassword = await hashPassword('Ilove8543@');
    console.log(hashedPassword);  // Use this hashed password when inserting the admin user
})();*/


const bcrypt = require('bcryptjs');
const saltRounds = 10;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};

(async () => {
    const hashedPassword = await hashPassword('Ilove8543@');
    console.log(hashedPassword);  // Use this hashed password when inserting the admin user
})();
