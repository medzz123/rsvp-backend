import { Request, Response } from 'express';
import { assert, Infer, object, string } from 'superstruct';

import { db } from '../db';
import { handleError } from '../utils/handleError';

const GetReply = object({
  id: string(),
  event: string(),
  token: string(),
});

type CreateGetReplyBody = Infer<typeof GetReply>;

export const getReply = async (
  req: Request<CreateGetReplyBody>,
  res: Response
) => {
  try {
    assert(req.query, GetReply);

    const { id, event, token } = req.query;

    const ref = db.collection('users').doc(id).collection('events').doc(event);

    const eventSnapshot = await ref.get();

    const eventData = eventSnapshot.data();

    const guestData = await ref.collection('attendees').doc(token).get();

    if (!eventData || !guestData) {
      return res
        .status(404)
        .send({ message: 'Could not find an event or attendee' });
    }

    return res.status(200).send({
      ...eventData,
      ...guestData.data(),
    });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};
