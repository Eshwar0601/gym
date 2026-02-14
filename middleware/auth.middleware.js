const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (checkIfValueIsEmpty(authHeader) || (!checkIfValueIsEmpty(authHeader) && !authHeader.startsWith('Bearer '))) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, 'SAMPLE_SECRET')

    req.user = decoded
    next()

  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
