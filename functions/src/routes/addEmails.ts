import { Response } from 'express';

import { db } from '../db';
import { CustomRequest } from '../types/request';
import { nanoid } from '../utils/uid';

export interface AddEmailsBody {
  emails: string[];
  id: string;
}

export const addEmails = async (
  req: CustomRequest<AddEmailsBody>,
  res: Response
) => {
  const { emails, id } = req.body;

  const attendees = emails.map((email) => ({
    attending: false,
    email,
    replied: false,
    token: nanoid(),
  }));

  const uid = (req as any).authId;

  const userRef = db.collection('users').doc(uid);

  try {
    const eventRef = userRef.collection('events').doc(id);

    await db.runTransaction(async (t) => {
      attendees.forEach((person) => {
        const attendeesRef = eventRef.collection('attendees').doc(person.token);
        t.create(attendeesRef, person);
      });
    });

    res.status(201).send('Added and sent emails');
  } catch (err) {
    console.log('Failed on creating a new event', err);
    res.status(500).send('Internal Server Error');
  }
};
