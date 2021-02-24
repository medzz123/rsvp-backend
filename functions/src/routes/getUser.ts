import { Request, Response } from 'express';

import admin, { db } from '../db';

const getUser = async (req: Request, res: Response) => {
  try {
    const { uid } = await admin.auth().getUserByEmail((req as any).email);

    const ref = db.collection('users').doc(uid);

    const userSnapshot = await ref.get();

    const userData = userSnapshot.data();

    const eventSnapshot = await ref.collection('events').get();

    const events = eventSnapshot.docs.map((event) => {
      return event.data();
    });

    res.send({ ...userData, events });
  } catch (err) {
    console.log('Error getting a user', err);
    res.status(500).send('Internal Server Error');
  }
};

export { getUser };
