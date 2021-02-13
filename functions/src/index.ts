import * as cors from 'cors';
import * as express from 'express';
import * as functions from 'firebase-functions';

import { onNewUser } from './firestore/onNewUser';
import { addEmails } from './routes/addEmails';
import { createEvent } from './routes/createEvent';
import { getEvent } from './routes/getEvent';

const app = express();
app.use(express.json());

app.use(cors({ origin: true }));

app.get('/event/:eventId', getEvent);
app.post('/event', createEvent);
app.post('/event/add', addEmails);

export const main = functions.region('europe-west1').https.onRequest(app);

export const createFirebaseUser = functions
  .region('europe-west1')
  .auth.user()
  .onCreate(onNewUser);
