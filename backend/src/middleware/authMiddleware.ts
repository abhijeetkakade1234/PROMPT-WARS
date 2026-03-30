import { Request, Response, NextFunction } from 'express';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-admin-token'];

  if (token === ADMIN_SECRET) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid Galactic Admin Credentials" });
  }
};
