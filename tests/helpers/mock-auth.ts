import { vi } from "vitest"

/**
 * Mock the auth session to simulate a logged-in user
 */
export function mockAuthSession(userId: string) {
  // Mock the getRequiredUserId function
  vi.mock("@/lib/auth/session", () => ({
    getRequiredUserId: vi.fn().mockResolvedValue(userId),
    getUserId: vi.fn().mockResolvedValue(userId),
  }))
}

/**
 * Mock no authenticated user
 */
export function mockNoAuthSession() {
  vi.mock("@/lib/auth/session", () => ({
    getRequiredUserId: vi.fn().mockRejectedValue(new Error("Unauthorized")),
    getUserId: vi.fn().mockResolvedValue(null),
  }))
}

/**
 * Clear auth mocks
 */
export function clearAuthMocks() {
  vi.clearAllMocks()
}
