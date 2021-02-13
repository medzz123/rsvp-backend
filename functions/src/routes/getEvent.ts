import { Request, Response } from 'express';

import { db } from '../db';

const USER_ID = 'FTdPkCzvCONxHShgR9Dl';

export const getEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  if (!eventId) {
    res.status(400).send('Event Id os required');
  }

  try {
    const ref = db
      .collection('users')
      .doc(USER_ID)
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
