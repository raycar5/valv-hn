import { render, html } from "lit-html";
import { interval, BehaviorSubject, Subject, Observable } from "rxjs";
import { take, map, filter, scan, tap, count } from "rxjs/operators";
import { asyncr, eventToSubject, BlocRepo, Widget } from "./lit-rx";

class CounterBloc {
  public readonly incrementSubject = new Subject<any>();
  private readonly numberSubject: Subject<number>;
  public readonly countObservable: Observable<number>;

  constructor(initialValue: number = 0) {
    this.numberSubject = new BehaviorSubject(initialValue);
    this.incrementSubject
      .pipe(scan(acc => ++acc, initialValue))
      .subscribe(this.numberSubject);
    this.countObservable = this.numberSubject;
  }
}

const ButtonWidget = Widget(
  blocs =>
    html`
      <button
        @click="${eventToSubject(blocs.of(CounterBloc).incrementSubject)}"
      >
        Click me
      </button>
    `
);

const DisplayWidget = Widget(
  blocs =>
    html`
      &nbsp;
      ${
        asyncr(blocs.of(CounterBloc).countObservable, v =>
          v > 10
            ? html`
                <b>${v}</b>
              `
            : html`
                <i>${v}</i>
              `
        )
      }
    `
);

const blocs = new BlocRepo();
blocs.register(CounterBloc);

render(
  html`
    ${ButtonWidget(blocs)} ${DisplayWidget(blocs)}
  `,
  document.getElementById("body")
);
