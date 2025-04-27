import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb'; // this should point to your mongodb.ts file

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('Bills_Summary');

    const reps = await db.collection('RepresentativeInfo').find({}).toArray();

    const formattedReps = reps.map((rep) => ({
      name: rep.Name,
      district: rep.District,
      phone: rep.Phone,
      emailUrl: rep["Email Member"],
    }));

    res.status(200).json(formattedReps);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unable to fetch representatives" });
  }
}
