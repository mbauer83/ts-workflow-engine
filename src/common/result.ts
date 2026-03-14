export type Result<T, E = string> = 
  | { success: true; value: T } 
  | { success: false; error: E }

export const success = <T>(value: T): Result<T, any> => ({ success: true, value })
export const failure = <E>(error: E): Result<any, E> => ({ success: false, error })