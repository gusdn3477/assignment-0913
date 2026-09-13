export class MockApiError extends Error {
  constructor(
    public readonly code:
      | "storage"
      | "corrupt-storage"
      | "network"
      | "not-found"
      | "invalid-input"
      | "busy",
    message: string,
  ) {
    super(message);
    this.name = "MockApiError";
  }
}
