export const MOCK_API_ERROR_CODES = {
  STORAGE: "storage",
  CORRUPT_STORAGE: "corrupt-storage",
  NETWORK: "network",
  NOT_FOUND: "not-found",
  INVALID_INPUT: "invalid-input",
  BUSY: "busy",
} as const;

export type MockApiErrorCode =
  (typeof MOCK_API_ERROR_CODES)[keyof typeof MOCK_API_ERROR_CODES];

export const DEFAULT_CANDIDATE_LOAD_ERROR_MESSAGE =
  "잠시 후 다시 불러와 주세요.";

export const CANDIDATE_LOAD_ERROR_MESSAGES: Readonly<
  Partial<Record<MockApiErrorCode, string>>
> = {
  [MOCK_API_ERROR_CODES.CORRUPT_STORAGE]:
    "저장된 지원자 정보를 읽을 수 없어요. 브라우저 저장 데이터를 확인한 뒤 다시 불러와 주세요.",
  [MOCK_API_ERROR_CODES.STORAGE]:
    "브라우저 저장소에 접근할 수 없어요. 사이트의 저장소 사용 설정을 확인한 뒤 다시 불러와 주세요.",
};
