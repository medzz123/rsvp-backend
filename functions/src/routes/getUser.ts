import { Request, Response } from 'express';

import { db } from '../db';

const USER_ID = 'FTdPkCzvCONxHShgR9Dl';

const getUser = async (_: Request, res: Response) => {
  try {
    const ref = db.collection('users').doc(USER_ID);

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
