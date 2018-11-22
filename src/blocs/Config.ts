export class ConfigBloc {
  public readonly areAnimationsSupported =
    document.documentElement.animate !== undefined;
}
