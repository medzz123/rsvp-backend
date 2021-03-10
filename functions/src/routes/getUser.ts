import { Request, Response } from 'express';

import admin, { db } from '../db';
import { handleError } from '../utils/handleError';

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

    return res.send({ ...userData, events });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};

export { getUser };
