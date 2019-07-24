const jwt = require('jsonwebtoken');

const restricted = async (req, res, next) => {
  console.log(req.headers);
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({
      status: 401,
      error: 'You need a token to access this route',
    });
  }
  try {
    const decoded = await jwt.verify(token, process.env.SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(401).send({
      status: 401,
      error: 'Invalid token',
    });
  }
  return next();
};

module.exports = restricted;
