import { Request, Response } from 'express';

import admin, { db } from '../db';
import { handleError } from '../utils/handleError';

export const getEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).send('Event Id is required');
  }

  try {
    const { uid } = await admin.auth().getUserByEmail((req as any).email);

    const ref = db
      .collection('users')
      .doc(uid)
      .collection('events')
      .doc(eventId);

    const eventSnapshot = await ref.get();

    const eventData = eventSnapshot.data();

    const attendeesSnapshot = await ref.collection('attendees').get();

    const attendees = attendeesSnapshot.docs.map((attendee) => {
      return attendee.data();
    });

    return res.send({ ...eventData, attendees });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send(message);
  }
};
