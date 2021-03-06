import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.86.0/testing/asserts.ts";
import {
  IsString,
  IsNumber,
  IsSymbol,
  IsBoolean,
  IsFunction,
  IsDate,
  IsLiteral,
  IsArray,
  IsUnion,
  IsObject,
  IsIntersection,
  IsDictionary,
  Optional,
  DoNotCare,
  Assert,
  IsTuple,
} from "./mod.ts";

for (const [name, data, checker] of [
  ["IsString", "test string" as any, IsString as any],
  ["IsNumber", 123, IsNumber],
  ["IsSymbol", Symbol(123), IsSymbol],
  ["IsBoolean", false, IsBoolean],
  ["IsFunction", () => {}, IsFunction],
  ["IsDate", new Date(2000, 1, 1), IsDate],
  ["IsLiteral", "Literal", IsLiteral("Literal")],
  ["IsArray of numbers", [1, 2, 3, 4], IsArray(IsNumber)],
  ["IsArray of strings", ["1", "2"], IsArray(IsString)],
  [
    "IsUnion of Test or 123 p1",
    "Test",
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  [
    "IsUnion of Test or 123 p2",
    123,
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  ["IsObject with number", { test: 123 }, IsObject({ test: IsNumber })],
  [
    "IsIntersection",
    { test: 123, other: "test" },
    IsIntersection(IsObject({ test: IsNumber }), IsObject({ other: IsString })),
  ],
  [
    "IsIntersection with dictionary",
    { test: 123, other: "test" },
    IsIntersection(IsDictionary(IsNumber), IsObject({ other: IsString })),
  ],
  [
    "IsIntersection with dictionary of objects and null other item",
    { test: { id: 1 }, other: null },
    IsIntersection(
      IsDictionary(IsObject({ id: IsNumber })),
      IsObject({ other: Optional(IsString) })
    ),
  ],
  [
    "IsDictionary of numbers",
    { test: 123, other: 321 },
    IsDictionary(IsNumber),
  ],
  [
    "IsDictionary of string",
    { test: "123", other: "321" },
    IsDictionary(IsString),
  ],
  ["Optional", undefined, Optional(IsNumber)],
  ["DotNotCare on string", "test", DoNotCare],
  ["DoNotCare on date", Date.UTC(2000, 1, 1), DoNotCare],
  ["Tuple", ["test", 123], IsTuple(IsString, IsNumber)],
  ["Tuple or numbers", [1, 2], IsTuple(IsNumber, IsNumber)],
  ["Array of tuple or numbers", [[1, 2]], IsArray(IsTuple(IsNumber, IsNumber))],
  ["An empty dictionary", {}, IsDictionary(IsString)],
  ["An empty string in a dictionary", { test: "" }, IsDictionary(IsString)],
]) {
  Deno.test(`Correctly assignes to true for ${name}`, () => {
    assertEquals(checker(data), true);
  });
}

for (const [name, data, checker] of [
  ["IsString", 123 as any, IsString as any],
  ["IsNumber", "test string", IsNumber],
  ["IsSymbol", 123, IsSymbol],
  ["IsBoolean", 123, IsBoolean],
  ["IsFunction", 123, IsFunction],
  ["IsDate", 123, IsDate],
  ["IsLiteral", "No Literal", IsLiteral("Literal")],
  ["IsArray of numbers", ["1", "2"], IsArray(IsNumber)],
  ["IsArray of strings", [1, 2, 3, 4], IsArray(IsString)],
  [
    "IsUnion of Test or 123 p1",
    "Not a test",
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  [
    "IsUnion of Test or 123 p2",
    321,
    IsUnion(IsLiteral("Test"), IsLiteral(123)),
  ],
  [
    "IsObject with number",
    { test: "test string" },
    IsObject({ test: IsNumber }),
  ],
  [
    "IsIntersection",
    { test: "test string", other: 123 },
    IsIntersection(IsObject({ test: IsNumber }), IsObject({ other: IsString })),
  ],
  [
    "IsIntersection with dictionary",
    { other: "test" },
    IsIntersection(IsDictionary(IsNumber), IsObject({ other: IsString })),
  ],
  [
    "IsDictionary of numbers",
    { test: "123", other: 321 },
    IsDictionary(IsNumber),
  ],
  ["Optional", false, Optional(IsNumber)],
  ["Tuple", [123, "test"], IsTuple(IsString, IsNumber)],
]) {
  Deno.test(`Correctly assignes to false for ${name}`, () => {
    assertEquals(checker(data), false);
  });
}

Deno.test("Throws error for assert", () => {
  assertThrows(() => Assert(IsString, 123));
});

Deno.test("Does not throw if correct type", () => {
  Assert(IsString, "123");
});

Deno.test("Does not throw if correct type deep", () => {
  Assert(IsObject({ parameter: IsString }), { parameter: "test" });
});
