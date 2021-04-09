import { StructError } from 'superstruct';

export const handleError = (err: any): { code: number; message: string } => {
  if (err instanceof StructError) {
    return { code: 400, message: err.message };
  }

  if (typeof err === 'object' && err !== null) {
    return { code: 500, message: err.message };
  }

  return { code: 500, message: 'Something went wrong and I dont know what' };
};
