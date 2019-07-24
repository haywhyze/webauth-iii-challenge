const bcrypt = require('bcryptjs');
const Users = require('./users/users-model.js');

function checkCredentialsInBody(req, res, next) {
  const { username, password } = req.body;
  if (username && password) {
    Users.findBy({ username })
      .first()
      .then((user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
          req.user = user;
          next();
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json(error);
      });
  } else {
    res.status(400).json({ message: 'No Credentials Provided' });
  }
}

module.exports = checkCredentialsInBody;
