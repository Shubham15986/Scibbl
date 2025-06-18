import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
}
