import { describe, expect, it } from "vitest";
import { act1Content } from "../../content/act1/content";
import {
  buildApartmentGeometry,
  tileToPixelCenter
} from "./ApartmentRenderer";

describe("ApartmentRenderer geometry", () => {
  it("converts every collision rectangle to integer pixels", () => {
    const geometry = buildApartmentGeometry(
      act1Content.map,
      act1Content.interactables
    );

    for (const rectangle of geometry.collisions) {
      expect(Number.isInteger(rectangle.x)).toBe(true);
      expect(Number.isInteger(rectangle.y)).toBe(true);
      expect(Number.isInteger(rectangle.width)).toBe(true);
      expect(Number.isInteger(rectangle.height)).toBe(true);
    }
  });

  it("converts interactable tiles to centered integer pixels", () => {
    const geometry = buildApartmentGeometry(
      act1Content.map,
      act1Content.interactables
    );

    expect(geometry.interactables.find((item) => item.id === "obj_cardboard_box"))
      .toMatchObject({ x: 208, y: 432 });
    expect(geometry.interactables.find((item) => item.id === "obj_laojiu_jar"))
      .toMatchObject({ x: 816, y: 272 });
  });

  it("rounds camera and actor coordinates to whole pixels", () => {
    expect(tileToPixelCenter({ x: 14, y: 15 }, 32)).toEqual({
      x: 464,
      y: 496
    });
  });
});
