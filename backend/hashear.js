
const bcrypt = require('bcrypt');

const password = '1234'; 

bcrypt.hash(password, 10).then(hash => {
  console.log('Hash generado:', hash);
});
