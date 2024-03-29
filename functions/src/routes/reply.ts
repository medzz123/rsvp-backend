import { Response } from 'express';
import * as admin from 'firebase-admin';
import { assert, boolean, Infer, object, string } from 'superstruct';

import { db } from '../db';
import { CustomRequest } from '../types/request';
import { handleError } from '../utils/handleError';

const Reply = object({
  id: string(),
  event: string(),
  token: string(),
  attending: boolean(),
});

type CreateGetReplyBody = Infer<typeof Reply>;

export const reply = async (
  req: CustomRequest<CreateGetReplyBody>,
  res: Response
) => {
  try {
    assert(req.body, Reply);

    const { id, event, token, attending } = req.body;

    await db
      .collection('users')
      .doc(id)
      .collection('events')
      .doc(event)
      .collection('attendees')
      .doc(token)
      .update({
        replied: true,
        attending: attending,
      });

    if (attending === true) {
      const guestEmailSnap = await db
        .collection('users')
        .doc(id)
        .collection('events')
        .doc(event)
        .collection('attendees')
        .doc(token)
        .get();

      const data = guestEmailSnap.data();

      if (data) {
        await db
          .collection('reminder')
          .doc(event)
          .update({
            emails: admin.firestore.FieldValue.arrayUnion(data.email),
          });
      }
    }

    return res.status(200).send({ message: 'Successfully replied' });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};
