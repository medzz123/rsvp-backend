import { Request, Response } from 'express';

import admin, { db } from '../db';

export const getEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  if (!eventId) {
    res.status(400).send('Event Id os required');
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

    res.send({ ...eventData, attendees });
  } catch (err) {
    console.log('Error getting an event', err);
    res.status(500).send('Internal Server Error');
  }
};
