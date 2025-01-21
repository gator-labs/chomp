import { getUsername } from "@/app/utils/getUsernameForLeaderboard";

jest.mock("@/app/utils/wallet", () => ({
  formatAddress: jest.fn((address) => `formatted_${address}`),
}));

describe("getUserName", () => {
  it("should return the username if it exists", () => {
    const user = { username: "testuser", wallets: [] };
    expect(getUsername(user)).toBe("@testuser");
  });

  it("should return the formatted address if username does not exist but address exists", () => {
    const user = { username: undefined, wallets: [{ address: "0x123" }] };
    expect(getUsername(user)).toBe("formatted_0x123");
  });

  it("should return 'mocked user' if neither username nor address exists", () => {
    const user = { username: undefined, wallets: [] };
    expect(getUsername(user)).toBe("mocked user");
  });
});
