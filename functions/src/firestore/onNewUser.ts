import { auth } from 'firebase-admin';

import { db } from '../db';

export const onNewUser = async (user: auth.UserRecord) => {
  await db
    .collection('users')
    .doc(user.uid)
    .set({ name: user.displayName, username: user.uid });

  return;
};
