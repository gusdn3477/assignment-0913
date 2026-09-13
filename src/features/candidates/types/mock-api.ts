export type StoragePort = Pick<Storage, "getItem" | "setItem">;
export interface MockApiOptions {
  storage?: () => StoragePort;
  random?: () => number;
  sleep?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
}
