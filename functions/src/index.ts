if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}

import * as cors from 'cors';
import * as express from 'express';
import * as functions from 'firebase-functions';

import { onNewUser } from './firestore/onNewUser';
import { reminderPubSub } from './firestore/reminder';
import { createEvent } from './routes/createEvent';
import { createUser } from './routes/createUser';
import { getEvent } from './routes/getEvent';
import { getReply } from './routes/getReply';
import { getUser } from './routes/getUser';
import { reply } from './routes/reply';
import { superReminder } from './routes/superReminder';
import { imageUpload } from './routes/upload';
import { checkIfAuthenticated } from './utils/auth';

const app = express();
app.use(express.json());

app.use(cors({ origin: true }));

// Get events
app.get('/event/:eventId', checkIfAuthenticated, getEvent);
app.get('/user', checkIfAuthenticated, getUser);

// Post events
app.post('/event', checkIfAuthenticated, createEvent);
app.post('/create-user', createUser);

// Reply
app.post('/reply', reply);
app.get('/get-reply', getReply);

// Image Upload
app.post('/get-upload-urls', checkIfAuthenticated, imageUpload);

// Super
app.post('/super-reminder', superReminder);

export const main = functions.region('europe-west1').https.onRequest(app);

export const createFirebaseUser = functions
  .region('europe-west1')
  .auth.user()
  .onCreate(onNewUser);

export const reminder = functions
  .region('europe-west1')
  .pubsub.schedule('every 6 hours')
  .onRun(reminderPubSub);
