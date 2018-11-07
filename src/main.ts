import { render, html } from "lit-html";
import { BehaviorSubject, Subject, Observable } from "rxjs";
import { mapTo, merge, scan } from "rxjs/operators";
import { asyncr, eventToSubject, BlocRepo, Widget } from "./lit-rx";
import "@polymer/paper-button/paper-button.js";

class CounterBloc {
  public readonly incrementSubject = new Subject<any>();
  public readonly decrementSubject = new Subject<any>();
  private readonly numberSubject: Subject<number>;
  public readonly countObservable: Observable<number>;

  constructor(initialValue: number = 0) {
    this.numberSubject = new BehaviorSubject(initialValue);
    this.incrementSubject
      .pipe(
        mapTo(1),
        merge(this.decrementSubject.pipe(mapTo(-1))),
        scan((acc, v) => acc + v, initialValue)
      )
      .subscribe(this.numberSubject);
    this.countObservable = this.numberSubject;
  }
}

const IncrementButtonWidget = Widget(
  blocs =>
    html`
      <paper-button
        raised
        @click="${eventToSubject(blocs.of(CounterBloc).incrementSubject)}"
      >
        Increment
      </paper-button>
    `
);
const DecrementButtonWidget = Widget(
  blocs =>
    html`
      <custom-style>
        <style>
          paper-button.custom {
            background-color: #3333ff;
            font-family: Roboto, sans-serif;
          }
        </style>
      </custom-style>
      <paper-button
        raised
        class="custom"
        @click="${eventToSubject(blocs.of(CounterBloc).decrementSubject)}"
      >
        Decrement
      </paper-button>
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
    ${IncrementButtonWidget(blocs)} ${DisplayWidget(blocs)}
    ${DecrementButtonWidget(blocs)}
  `,
  document.getElementById("body")
);
