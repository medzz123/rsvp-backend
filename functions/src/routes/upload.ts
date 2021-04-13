import * as AWS from 'aws-sdk';
import { Response } from 'express';
import * as functions from 'firebase-functions';
import { nanoid } from 'nanoid';
import { assert, Infer, object, string } from 'superstruct';

import { CustomRequest } from '../types/request';
import { handleError } from '../utils/handleError';

const s3 = new AWS.S3({
  accessKeyId: functions.config().aws?.key || process.env.AWS_KEY,
  secretAccessKey: functions.config().aws?.secret || process.env.AWS_SECRET,
  region: 'eu-west-2',
});

const ImageUpload = object({
  name: string(),
});

type ImageUploadBody = Infer<typeof ImageUpload>;

export const imageUpload = async (
  req: CustomRequest<ImageUploadBody>,
  res: Response
) => {
  try {
    const { body } = req;
    assert(body, ImageUpload);

    const resourceKey = `uploads/${nanoid()}/${body.name}.png`;

    const putParams = {
      Bucket: 'rsvp-events',
      Key: resourceKey,
      Expires: 2 * 60,
      ContentType: 'image/jpeg',
    };

    const putUrl = s3.getSignedUrl('putObject', putParams);

    return res.status(201).send({
      put: putUrl,
      get: `https://rsvp-events.s3.eu-west-2.amazonaws.com/${resourceKey}`,
    });
  } catch (err) {
    const { code, message } = handleError(err);

    return res.status(code).send({ message });
  }
};
