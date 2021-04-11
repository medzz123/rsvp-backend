import * as sgMail from '@sendgrid/mail';
import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';

import { db } from '../db';

const API_KEY = functions.config().sendgrid.key;
const REMINDER_ID_TEMPLATE = 'd-3e9cac97911a440c8a832f653a874fa0';

sgMail.setApiKey(API_KEY);

export const dailyReminder = async () => {
  const formattedDate = dayjs().format('DD/MM/YYYY');

  const reminderSnapshots = await db
    .collection('reminders')
    .where('date', '==', formattedDate)
    .get();

  const emails = reminderSnapshots.docs.map((snap) => snap.data().email);

  const msg = {
    to: emails,
    from: 'hello@rsvpevents.uk',
    templateId: REMINDER_ID_TEMPLATE,
  };

  const batch = db.batch();

  reminderSnapshots.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  await sgMail.send(msg);

  return;
};
