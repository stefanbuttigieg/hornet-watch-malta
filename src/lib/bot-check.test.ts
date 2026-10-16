import { describe, expect, it } from "vitest";
import { isLikelyBot } from "./bot-check";

describe("isLikelyBot", () => {
  it("blocks when the hidden field is filled", () => expect(isLikelyBot("http://spam", 60000)).toBe(true));
  it("blocks forms sent in under 3 seconds", () => expect(isLikelyBot("", 2999)).toBe(true));
  it("allows a normal person", () => expect(isLikelyBot("", 3000)).toBe(false));
});
