import { Request, Response } from 'express';

import { dailyReminder } from '../firestore/reminder';
import { handleError } from '../utils/handleError';

const REMINDER_API_KEY = 'ugendo-bugendo-is-super';

export const superReminder = async (req: Request, res: Response) => {
  try {
    if (req?.headers?.key !== REMINDER_API_KEY) {
      return res
        .status(403)
        .send({ message: 'Your are not allowed to access this resource.' });
    }

    await dailyReminder();

    return res.status(200).send({ message: 'Reminders for today sent' });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};
