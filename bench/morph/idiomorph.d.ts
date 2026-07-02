// idiomorph ships no types; the bench needs only this sliver.
declare module "idiomorph" {
  export const Idiomorph: {
    morph(
      target: Element,
      content: string | Element,
      options?: { morphStyle?: "innerHTML" | "outerHTML" },
    ): void;
  };
}
