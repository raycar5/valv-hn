import { PartialObserver, Observable, BehaviorSubject } from "rxjs";

export enum PlayPauseAnimationAction {
  PLAY,
  PAUSE
}
export class PlayPauseAnimationBloc {
  public readonly $toggle: PartialObserver<PlayPauseAnimationAction>;
  public readonly toggle$: Observable<PlayPauseAnimationAction>;
  constructor() {
    const $toggle$ = new BehaviorSubject(PlayPauseAnimationAction.PLAY);
    this.toggle$ = $toggle$;
    this.$toggle = $toggle$;
  }
}
