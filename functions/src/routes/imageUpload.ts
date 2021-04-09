import * as AWS from 'aws-sdk';
import { Buffer } from 'buffer';
import * as functions from 'firebase-functions';
import { nanoid } from 'nanoid';

const s3 = new AWS.S3({
  accessKeyId: functions.config().aws.accessKey,
  secretAccessKey: functions.config().aws.secretAccessKey,
  region: 'us-east-1',
});

// I am the Netlify Function handler.
exports.handler = function (event, context, callback) {
  // NOTE: In production (on Netlify), we shouldn't need to deal with CORS headers
  // since the Functions folder is a sub-folder of the Netlify site (same origin).
  // However, in local development, the "netlify-lambda" script serves the Functions
  // from a different port. As such, we need to have the CORS headers locally. In
  // order to keep things simple, we're just going to include them in both places.
  const headers = {
    'Access-Control-Allow-Origin':
      process.env.NETLIFY_ACCESS_CONTROL_ALLOW_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // In the case of a CORS preflight check, just return early.
  if (event.httpMethod === 'OPTIONS') {
    callback(null, {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify('OK'),
    });
    return;
  }

  try {
    const body = parseBody(event.body, event.isBase64Encoded);

    const resourceKey = `uploads/${nanoid()}/${body.clientFilename}`;

    // The PUT operation will only be valid for the next 2-minutes.
    const putParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: resourceKey,
      Expires: 2 * 60,
      ContentType: body.mimeType,
    };

    // The GET operation will only be valid for the next 60-minutes.
    // --
    // NOTE: Even though the full GET operation is only valid for a week, we can
    // tell the browser to cache the response for longer using the cache-control
    // header (which we are defining via the ResponseCacheControl override).
    const getParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: resourceKey,
      Expires: 60 * 60,
      ResponseCacheControl: 'max-age=604800',
    };

    const putUrl = s3.getSignedUrl('putObject', putParams);
    const getUrl = s3.getSignedUrl('getObject', getParams);

    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        putUrl: putUrl,
        getUrl: getUrl,
      }),
    };
    callback(null, response);
  } catch (error) {
    console.error(error);

    const response = {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        message: 'Request could not be processed.',
      }),
    };

    callback(null, response);
  }
};

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

// I returns the parsed body payload.
// --
// CAUTION: Throws error if body cannot be parsed as JSON.
function parseBody(body, isBase64Encoded) {
  const normalizedBody = isBase64Encoded ? fromBase64(body) : body;
  return JSON.parse(normalizedBody);
}

// I decode the given base64-encoded value into a utf-8 string.
function fromBase64(encodedValue) {
  return Buffer.from(encodedValue, 'base64').toString('utf8');
}
