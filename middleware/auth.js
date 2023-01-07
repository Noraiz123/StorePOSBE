import jwt from 'jsonwebtoken';

const secret = 'test';

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    let decodedData = jwt.verify(token, secret);

    req.userId = decodedData?.id;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
    console.log(error);
  }
};

export default auth;
