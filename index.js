/* eslint-disable no-console */
const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('./users/users-model.js');
const checkCredentialsInBody = require('./checkCredentialsInBody');
const restricted = require('./restricted');
require('dotenv').config();

const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

const generateToken = (id, department) => {
  const token = jwt.sign(
    {
      subject: id,
      department,
    },
    process.env.SECRET,
    { expiresIn: '1d' },
  );
  return token;
};

server.post('/api/register', (req, res) => {
  const { username, password, department } = req.body;
  if (username && password && department) {
    const hashedPassword = bcrypt.hashSync(password, 12);
    const user = {
      username,
      password: hashedPassword,
      department,
    };
    Users.add(user)
      .then((saved) => {
        const token = generateToken(saved.id, saved.department);
        res.status(201).json({
          id: saved.id,
          username: saved.username,
          department: saved.department,
          token,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json(error);
      });
  } else {
    res.status(400).json({ message: 'Required field(s) missing' });
  }
});

server.post('/api/login', checkCredentialsInBody, (req, res) => {
  const token = generateToken(req.user.id, req.user.department);
  res.status(200).json({
    message: 'Welcome!',
    token,
  });
});

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    });
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
