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

    const events = await Promise.all(
      eventSnapshot.docs.map(async (event) => {
        const eventData = event.data();

        const snap = await ref
          .collection('events')
          .doc(eventData.id)
          .collection('attendees')
          .get();

        const attendees = snap.docs.map((a) => a.data());

        eventData.attendees = attendees;

        return eventData;
      })
    );

    return res.send({ ...userData, events });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};

export { getUser };
