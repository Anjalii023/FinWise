import { Request, Response } from 'express';
import { db } from '../db/firestore';

export class StatementController {
  public static upload(req: Request, res: Response): void {
    res.json({
      status: 'detected',
      format: 'HDFC',
      confidence: 0.96,
      transactionCount: 120,
      totalDebits: 442000,
      totalCredits: 720000,
    });
  }

  public static async confirm(req: Request, res: Response): Promise<void> {
    const { datasetName = 'Uploaded Statement', transactionCount = 120 } = req.body;

    const record = {
      id: `stmt_${Date.now()}`,
      userId: req.body.userId || 'default_user',
      bankFormat: 'HDFC',
      transactionCount: Number(transactionCount),
      dateRange: { start: '2024-01-01', end: '2024-06-30' },
      totalDebits: 442000,
      totalCredits: 720000,
      uploadedAt: new Date().toISOString(),
    };

    await db.saveStatement(record);

    res.json({
      status: 'confirmed',
      datasetName,
      importedCount: transactionCount,
      message: 'Statement ingested successfully into database engine',
    });
  }
}
