import { Observable, BehaviorSubject, fromEvent } from "rxjs";
import {
  map,
  windowCount,
  flatMap,
  toArray,
  filter,
  mapTo
} from "rxjs/operators";
import isEqual from "lodash-es/isEqual";

const hardcode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
const easycode = [38, 38];
const code = hardcode;
export const localStorageKey = "unlocked-secret";
export class SecretCodeBloc {
  public readonly success$: Observable<boolean>;
  public readonly $unlocked$ = new BehaviorSubject(
    localStorage.getItem("unlocked-secret") == localStorageKey
  );
  constructor() {
    const $success$ = new BehaviorSubject(false);
    this.success$ = $success$;
    fromEvent(document, "keydown")
      .pipe(
        map((x: KeyboardEvent) => x.keyCode),
        windowCount(code.length, 1),
        flatMap(xo => xo.pipe(toArray())),
        filter(xarr => isEqual(code, xarr)),
        mapTo(true)
      )
      .subscribe($success$);

    this.$unlocked$.subscribe(unlocked =>
      unlocked ? localStorage.setItem(localStorageKey, localStorageKey) : null
    );
  }
}
