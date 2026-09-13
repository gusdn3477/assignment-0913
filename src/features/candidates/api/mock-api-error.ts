import type { MockApiErrorCode } from "@/features/candidates/constants/candidate-errors";

export class MockApiError extends Error {
  constructor(
    public readonly code: MockApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "MockApiError";
  }
}
