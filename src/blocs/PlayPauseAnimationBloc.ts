import { PartialObserver, Observable, BehaviorSubject } from "rxjs";

export enum PlayPauseAnimationAction {
  PLAY,
  PAUSE
}
export class PlayPauseAnimationBloc {
  public readonly toggleObserver: PartialObserver<PlayPauseAnimationAction>;
  public readonly toggleObservable: Observable<PlayPauseAnimationAction>;
  constructor() {
    const toggleSubject = new BehaviorSubject(PlayPauseAnimationAction.PLAY);
    this.toggleObservable = toggleSubject;
    this.toggleObserver = toggleSubject;
  }
}
