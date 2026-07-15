import { afterEach, describe, expect, it, vi } from "vitest";
import type { ShippingZoneTable } from "../shipping";

const zones: ShippingZoneTable[] = [
  {
    zoneName: "Continental US",
    states: ["CA", "NY"],
    bands: [{ minWeightGrams: 0, maxWeightGrams: 5000, rateCents: 1500, transitMinDays: 5, transitMaxDays: 9 }],
  },
];

const fullAddress = {
  fullName: "Jane Doe",
  line1: "123 Main St",
  city: "Los Angeles",
  state: "CA",
  postalCode: "90001",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.doUnmock("../shipping-easypost");
});

describe("getShippingQuote", () => {
  it("uses the static rate table when EasyPost is not configured", async () => {
    vi.stubEnv("EASYPOST_API_KEY", "");
    const { getShippingQuote } = await import("../shipping-provider");

    const quote = await getShippingQuote({
      toAddress: fullAddress,
      itemWeightsGrams: [500],
      zones,
    });

    expect(quote.source).toBe("static");
    expect(quote.shippingCents).toBe(1500);
  });

  it("uses the static rate table when the destination address is incomplete", async () => {
    vi.stubEnv("EASYPOST_API_KEY", "test_key");
    const { getShippingQuote } = await import("../shipping-provider");

    const quote = await getShippingQuote({
      toAddress: { fullName: "Jane Doe", line1: "", city: "", state: "CA", postalCode: "" },
      itemWeightsGrams: [500],
      zones,
    });

    expect(quote.source).toBe("static");
  });

  it("uses the live EasyPost rate when configured and the API call succeeds", async () => {
    vi.stubEnv("EASYPOST_API_KEY", "test_key");
    vi.doMock("../shipping-easypost", () => ({
      isEasyPostConfigured: () => true,
      getEasyPostRate: vi.fn().mockResolvedValue({
        shippingCents: 2345,
        transitMinDays: 3,
        transitMaxDays: 5,
        zoneName: "USPS Priority",
      }),
    }));

    const { getShippingQuote } = await import("../shipping-provider");
    const quote = await getShippingQuote({
      toAddress: fullAddress,
      itemWeightsGrams: [500],
      zones,
    });

    expect(quote.source).toBe("easypost");
    expect(quote.shippingCents).toBe(2345);
    expect(quote.zoneName).toBe("USPS Priority");
  });

  it("falls back to the static rate table when the EasyPost API call throws", async () => {
    vi.stubEnv("EASYPOST_API_KEY", "test_key");
    vi.doMock("../shipping-easypost", () => ({
      isEasyPostConfigured: () => true,
      getEasyPostRate: vi.fn().mockRejectedValue(new Error("network error")),
    }));

    const { getShippingQuote } = await import("../shipping-provider");
    const quote = await getShippingQuote({
      toAddress: fullAddress,
      itemWeightsGrams: [500],
      zones,
    });

    expect(quote.source).toBe("static");
    expect(quote.shippingCents).toBe(1500);
  });

  it("falls back to the static rate table when EasyPost returns no rates", async () => {
    vi.stubEnv("EASYPOST_API_KEY", "test_key");
    vi.doMock("../shipping-easypost", () => ({
      isEasyPostConfigured: () => true,
      getEasyPostRate: vi.fn().mockResolvedValue(null),
    }));

    const { getShippingQuote } = await import("../shipping-provider");
    const quote = await getShippingQuote({
      toAddress: fullAddress,
      itemWeightsGrams: [500],
      zones,
    });

    expect(quote.source).toBe("static");
  });
});
