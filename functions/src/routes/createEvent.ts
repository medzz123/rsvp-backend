import * as sgMail from '@sendgrid/mail';
import { Response } from 'express';
import * as functions from 'firebase-functions';
import {
  array,
  assert,
  Infer,
  object,
  optional,
  size,
  string,
} from 'superstruct';

import admin, { db } from '../db';
import { CustomRequest } from '../types/request';
import { handleError } from '../utils/handleError';
import { nanoid, tinyId } from '../utils/uid';

const API_KEY = functions.config().sendgrid?.key || process.env.SENDGRID_KEY;

sgMail.setApiKey(API_KEY);

const Event = object({
  image: optional(string()),
  name: string(),
  startTime: string(),
  endTime: string(),
  location: string(),
  description: optional(string()),
  title: string(),
  date: string(),
  emails: size(array(string()), 1, 5),
});

type EventBody = Infer<typeof Event>;

export const createEvent = async (
  req: CustomRequest<EventBody>,
  res: Response
) => {
  try {
    assert(req.body, Event);

    const {
      name,
      location,
      emails,
      startTime,
      endTime,
      description,
      title,
      date,
      image,
    } = req.body;

    const attendees = emails.map((email) => ({
      attending: false,
      email,
      replied: false,
      token: nanoid(),
    }));

    const { uid } = await admin.auth().getUserByEmail((req as any).email);

    const userRef = db.collection('users').doc(uid);

    const autoGeneratedId = `${name.toLowerCase()}-${tinyId()}`;
    const newEvent = await userRef
      .collection('events')
      .doc(autoGeneratedId)
      .set({
        image: image || '/assets/party-1.svg',
        name,
        location: location,
        id: autoGeneratedId,
        startTime: startTime,
        endTime: endTime,
        description: description || null,
        title: title,
        date,
      });

    const eventRef = userRef.collection('events').doc(autoGeneratedId);

    await db.runTransaction(async (t) => {
      attendees.forEach((person) => {
        const attendeesRef = eventRef.collection('attendees').doc(person.token);
        t.create(attendeesRef, person);
      });
    });

    const emailList = attendees.map((guest) => ({
      to: guest.email,
      from: 'hello@rsvpevents.uk',
      templateId: 'd-0b107bcb294c4891b9f461d177c6093d',
      dynamic_template_data: {
        title,
        event_name: name,
        event_location: location,
        start_time: startTime,
        end_time: endTime,
        confirmation_url: `https://www.rsvpevents.uk/invite-reply?id=${uid}&event=${autoGeneratedId}&token=${guest.token}`,
      },
    }));

    const promiseList = emailList.map((email) => sgMail.send(email));

    await Promise.all(promiseList);

    const reminderRef = db.collection('reminder');

    await reminderRef.doc(autoGeneratedId).set({
      date,
      name,
      emails: [],
    });

    return res.status(201).send(newEvent);
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};
