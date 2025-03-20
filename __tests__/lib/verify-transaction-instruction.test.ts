import { getSolPaymentAddress } from "@/app/utils/getSolPaymentAddress";
import { CONNECTION } from "@/app/utils/solana";
import { verifyTransactionInstructions } from "@/lib/verifyTransactionInstructions";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import pRetry from "p-retry";

// Mock the dependencies
jest.mock("@/app/utils/getSolPaymentAddress");
jest.mock("@/app/utils/solana", () => ({
  CONNECTION: {
    getParsedTransaction: jest.fn(),
  },
}));
jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("verifyTransactionInstructions", () => {
  const mockSolPaymentAddress = "9XvGnxNECxLUYYGPLGNuVtSdKQEMJio7DUNSGHAxxee7";
  const mockTxHash = "mock-tx-hash";
  const mockSolAmount = "0.1";
  const mockWalletAddress = "8YLKoCUN3VC2LgRsUmdcE5bfxdWzPcCSmvPvnDXQtKmJ";
  const expectedLamports = 0.1 * LAMPORTS_PER_SOL;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getSolPaymentAddress to return our test address
    (getSolPaymentAddress as jest.Mock).mockResolvedValue(
      mockSolPaymentAddress,
    );

    // Mock pRetry to just call the function passed to it
    (pRetry as jest.Mock).mockImplementation((fn) => fn());
  });

  test("should return error when SOL payment address is not defined", async () => {
    // Arrange
    (getSolPaymentAddress as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      error: "SOL Payment Address is not defined",
    });
  });

  test("should return error when transaction is not found", async () => {
    // Arrange
    (CONNECTION.getParsedTransaction as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      error: "Transaction not found",
    });
  });

  test("should return error when transaction has failed", async () => {
    // Arrange
    (CONNECTION.getParsedTransaction as jest.Mock).mockResolvedValue({
      meta: {
        err: { InsufficientFundsForRent: { account_index: 0 } },
      },
      transaction: {
        message: {
          accountKeys: [],
          instructions: [],
        },
      },
    });

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      error: "Transaction Failed",
    });
  });

  test("should detect invalid SOL payment address outflow", async () => {
    // Arrange
    (CONNECTION.getParsedTransaction as jest.Mock).mockResolvedValue({
      meta: {},
      transaction: {
        message: {
          accountKeys: [{ pubkey: { toBase58: () => mockWalletAddress } }],
          instructions: [
            {
              parsed: {
                type: "transfer",
                info: {
                  source: mockSolPaymentAddress,
                  destination: mockWalletAddress,
                  lamports: 1000000,
                },
              },
            },
          ],
        },
      },
    });

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      error: "Invalid SOL Payment Address outflow detected",
    });
  });

  test("should verify successful transaction with correct transfer", async () => {
    // Arrange
    const mockPubkey = {
      toBase58: () => mockWalletAddress,
    };

    (CONNECTION.getParsedTransaction as jest.Mock).mockResolvedValue({
      meta: {},
      transaction: {
        message: {
          accountKeys: [{ pubkey: mockPubkey }],
          instructions: [
            {
              parsed: {
                type: "transfer",
                info: {
                  source: mockWalletAddress,
                  destination: mockSolPaymentAddress,
                  lamports: expectedLamports,
                },
              },
            },
          ],
        },
      },
    });

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: true,
      wallet: mockWalletAddress,
    });
  });

  test("should fail verification when transfer amount doesn't match", async () => {
    // Arrange
    const mockPubkey = {
      toBase58: () => mockWalletAddress,
    };

    (CONNECTION.getParsedTransaction as jest.Mock).mockResolvedValue({
      meta: {},
      transaction: {
        message: {
          accountKeys: [{ pubkey: mockPubkey }],
          instructions: [
            {
              parsed: {
                type: "transfer",
                info: {
                  source: mockWalletAddress,
                  destination: mockSolPaymentAddress,
                  lamports: expectedLamports - 1000, // Incorrect amount
                },
              },
            },
          ],
        },
      },
    });

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      wallet: mockWalletAddress,
      error: "Transfer instruction verification failed",
    });
  });

  test("should fail verification when destination address doesn't match", async () => {
    // Arrange
    const mockPubkey = {
      toBase58: () => mockWalletAddress,
    };

    (CONNECTION.getParsedTransaction as jest.Mock).mockResolvedValue({
      meta: {},
      transaction: {
        message: {
          accountKeys: [{ pubkey: mockPubkey }],
          instructions: [
            {
              parsed: {
                type: "transfer",
                info: {
                  source: mockWalletAddress,
                  destination: "DifferentAddress123456789", // Wrong destination
                  lamports: expectedLamports,
                },
              },
            },
          ],
        },
      },
    });

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      wallet: mockWalletAddress,
      error: "Transfer instruction verification failed",
    });
  });

  test("should handle error during transaction verification", async () => {
    // Arrange
    const errorMessage = "Network error";
    (CONNECTION.getParsedTransaction as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      error: errorMessage,
    });
  });

  test("should handle non-Error objects thrown during verification", async () => {
    // Arrange
    (CONNECTION.getParsedTransaction as jest.Mock).mockRejectedValue(
      "String error",
    );

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: false,
      error: "Unknown error during verification",
    });
  });

  test("should handle transaction with multiple instructions but correct transfer", async () => {
    // Arrange
    const mockPubkey = {
      toBase58: () => mockWalletAddress,
    };

    (CONNECTION.getParsedTransaction as jest.Mock).mockResolvedValue({
      meta: {},
      transaction: {
        message: {
          accountKeys: [{ pubkey: mockPubkey }],
          instructions: [
            {
              program: "ComputeBudget111111111111111111111111111111",
              programId: {
                toBase58: () => "ComputeBudget111111111111111111111111111111",
              },
            },
            {
              parsed: {
                type: "transfer",
                info: {
                  source: mockWalletAddress,
                  destination: mockSolPaymentAddress,
                  lamports: expectedLamports,
                },
              },
            },
            {
              program: "Some other instruction",
              programId: {
                toBase58: () => "SomeOtherProgram111111111111111111111",
              },
            },
          ],
        },
      },
    });

    // Act
    const result = await verifyTransactionInstructions(
      mockTxHash,
      mockSolAmount,
    );

    // Assert
    expect(result).toEqual({
      success: true,
      wallet: mockWalletAddress,
    });
  });
});
