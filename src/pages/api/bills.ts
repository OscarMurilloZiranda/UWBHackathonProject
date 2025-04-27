import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('Bills_Summary');

    const bills = await db.collection('Bills').find({}).toArray();
    const brainrotBills = await db.collection('BrainrotBills').find({}).toArray();

    // Create a map of brainrot bills by bill_code
    const brainrotMap = new Map(
      brainrotBills.map((bill) => [bill.bill_code, bill.bill_summary])
    );

    // Merge brainrot summary into bills
    const mergedBills = bills.map((bill) => ({
      ...bill,
      brainrot_summary: brainrotMap.get(bill.bill_code) || null, // if no brainrot, set to null
    }));

    res.status(200).json(mergedBills);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unable to fetch bills" });
  }
}
