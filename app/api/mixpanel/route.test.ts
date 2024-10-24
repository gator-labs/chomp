import { getCurrentUser } from "@/app/queries/user";
import Mixpanel from "mixpanel";
import { NextRequest } from "next/server";

import { POST } from "./route";

// Mock dependencies
jest.mock("@/lib/kv");
jest.mock("mixpanel", () => {
  return {
    init: jest.fn(() => ({
      track: jest.fn(),
    })),
  };
});
jest.mock("@/app/queries/user", () => ({
  getCurrentUser: jest.fn(),
}));

describe("Mixpanel tracking route", () => {
  let mockRequest: NextRequest;
  let mockMixpanelTrack: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockMixpanelTrack = jest.fn();
    (Mixpanel.init as jest.Mock).mockReturnValue({ track: mockMixpanelTrack });
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    // Mock Request with utm params as property
    mockRequest = {
      json: jest.fn().mockResolvedValue({
        event: "Test Action",
        properties: { $utm_source: "test" },
      }),
      headers: new Headers({
        "x-forwarded-for": "127.0.0.1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0.0.0",
      }),
    } as unknown as NextRequest;
  });

  // Assertion of non-authenticated user event tracking
  it("should track event for non-authenticated user", async () => {
    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(responseData).toEqual({ status: "Event tracked successfully" });
  });

  // Assertion of authenticated user event tracking with mock user
  it("should track event for authenticated user", async () => {
    const mockUser = {
      id: "a19f7611-5cd2-49b8-ad81-69dc42a2a5a3",
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: null,
      lastName: null,
      username: "zani",
      profileSrc: null,
      tutorialCompletedAt: null,
      wallets: [
        {
          createdAt: new Date(),
          updatedAt: new Date(),
          address: "8Tj2Lx72kLttL7iCN5dsPQGTUzjQLpyctVcnV9oH8sPM",
          userId: "a19f7611-5cd2-49b8-ad81-69dc42a2a5a3",
        },
      ],
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(responseData).toEqual({ status: "Event tracked successfully" });
  });

  // Assertion of error handling with mock user error
  it("should handle errors and return Internal Server Error", async () => {
    (getCurrentUser as jest.Mock).mockRejectedValue(new Error("Test error"));

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(responseData).toEqual({ status: "Internal Server Error" });
  });
});
