import { Response } from 'express';
import { array, assert, Infer, object, string } from 'superstruct';

import admin, { db } from '../db';
import { CustomRequest } from '../types/request';
import { handleError } from '../utils/handleError';
import { nanoid } from '../utils/uid';

const AddEmailRequest = object({
  emails: array(string()),
  id: string(),
});

type AddEmailsBody = Infer<typeof AddEmailRequest>;

export const addEmails = async (
  req: CustomRequest<AddEmailsBody>,
  res: Response
) => {
  try {
    assert(req.body, AddEmailRequest);

    const { emails, id } = req.body;

    const attendees = emails.map((email) => ({
      attending: false,
      email,
      replied: false,
      token: nanoid(),
    }));

    const { uid } = await admin.auth().getUserByEmail((req as any).email);

    const userRef = db.collection('users').doc(uid);

    const eventRef = userRef.collection('events').doc(id);

    await db.runTransaction(async (t) => {
      attendees.forEach((person) => {
        const attendeesRef = eventRef.collection('attendees').doc(person.token);
        t.create(attendeesRef, person);
      });
    });

    return res.status(201).send({ message: 'Added and sent emails' });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};
