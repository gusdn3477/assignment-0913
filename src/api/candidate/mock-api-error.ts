import type { MockApiErrorCode } from "@/constants/candidate";

export class MockApiError extends Error {
  constructor(
    public readonly code: MockApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "MockApiError";
  }
}
