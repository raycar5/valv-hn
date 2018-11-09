import { Widget, BlocRepo, asynco } from "../lit-rx";
import { html, render } from "lit-html";
import { Observer, Subject, Observable, BehaviorSubject } from "rxjs";
import { map, filter, bufferCount } from "rxjs/operators";

/**
 * Widgets take a BlocRepo and return html
 */
export const SimpleWidget = Widget(blocs => {
  return html`
    Hello world
  `;
});

const blocs = new BlocRepo();

// render(SimpleWidget(blocs), document.getElementById("body"));

/**
 * Widgets compose easily
 */
export const ComposedWidget = Widget(blocs => {
  return html`
    <b>${SimpleWidget(blocs)}</b>
  `;
});

/**
 * Blocs have Observers for input and observables for output
 */
class SimpleBloc {
  // Observer takes in numbers
  public readonly observer: Observer<number>;

  // And the numbers are then pushed through the observable multiplied by 2
  public readonly observable: Observable<number>;
  constructor() {
    // A subject is both an observer and an observable, it simply passes items through
    const subject = new Subject<number>();

    // Since subject satisfies the observer interface we can just assign it
    this.observer = subject;

    /**
     * We can apply operations to observables and we get new observables that will modify the items as they go through
     */
    this.observable = subject.pipe(map(x => x * 2));
  }
}

class AdvancedBloc {
  public readonly observer: Observer<number>;

  public readonly observable: Observable<number>;

  constructor(initial: number = 0) {
    /**
     * Blocs can store state thanks to behavior subject
     * Whenever someone subscribes to a behaviorSubject it sends the latest item to the new subscriber
     */
    const subject = new BehaviorSubject<number>(initial);

    this.observer = subject;

    /**
     *  We can perform multiple operations on observables
     */
    this.observable = subject.pipe(
      map(x => x * x), // Square all items
      filter(x => x % 2 == 0), // Only take even numbers
      bufferCount(10), // Accumulate 10 items and emit them as an array
      map(x => x.reduce((acc, x) => acc + x, 0) / x.length) //Compute the average of the 10 items
    );
  }
}
blocs.register(AdvancedBloc, new AdvancedBloc(34));

// Widgets can react to observables
const DynamicWidget = Widget(blocs => {
  const advancedBloc = blocs.of(AdvancedBloc);
  return html`
    ${asynco(advancedBloc.observable)}
  `;
});

render(DynamicWidget(blocs), document.getElementById("body"));

let i = 1;
setInterval(() => {
  blocs.of(AdvancedBloc).observer.next(i++);
}, 1000);
