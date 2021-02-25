import { StructError } from 'superstruct';

export const handleError = (err: any): { code: number; message: string } => {
  if (err instanceof StructError) {
    return { code: 401, message: err.message };
  }

  if (typeof err === 'object' && err !== null) {
    return { code: 401, message: err.message };
  }

  return { code: 500, message: 'Internal Server Error' };
};
