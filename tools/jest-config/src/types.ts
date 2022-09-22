// eslint-disable-next-line  @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
declare namespace jest {
  interface Matchers<R> {
    toHaveFormattedText(text: string): R;
  }
}
