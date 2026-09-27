import { Request, Response } from 'express';
import { db } from '../db/firestore';

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    const userDoc = {
      uid: token,
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.saveUser(userDoc);

    res.json({
      success: true,
      token,
      user: {
        name,
        email,
      },
    });
  }

  public static async signup(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }

    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const userDoc = {
      uid: token,
      name: name || email.split('@')[0],
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.saveUser(userDoc);

    res.json({
      success: true,
      token,
      user: {
        name: userDoc.name,
        email,
      },
    });
  }
}
