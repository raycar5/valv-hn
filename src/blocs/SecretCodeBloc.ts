import { Observable, BehaviorSubject, fromEvent } from "rxjs";
import {
  map,
  windowCount,
  flatMap,
  toArray,
  filter,
  tap,
  mapTo
} from "rxjs/operators";
import { isEqual } from "lodash";

const hardcode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
const easycode = [38, 38];
const code = hardcode;
export const localStorageKey = "unlocked-secret";
export class SecretCodeBloc {
  public readonly successObservable: Observable<boolean>;
  public readonly unlockedSubject = new BehaviorSubject(
    localStorage.getItem("unlocked-secret") == localStorageKey
  );
  constructor() {
    const successSubject = new BehaviorSubject(false);
    this.successObservable = successSubject;
    fromEvent(document, "keydown")
      .pipe(
        map((x: KeyboardEvent) => x.keyCode),
        windowCount(code.length, 1),
        flatMap(xo => xo.pipe(toArray())),
        filter(xarr => isEqual(code, xarr)),
        mapTo(true)
      )
      .subscribe(successSubject);

    this.unlockedSubject.subscribe(unlocked =>
      unlocked ? localStorage.setItem(localStorageKey, localStorageKey) : null
    );
  }
}
