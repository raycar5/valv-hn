import { Observable, Subject } from "rxjs";
import { asyncReplace } from "lit-html/directives/async-replace";
import { TemplateResult } from "lit-html";

export type Widget<T> = (blocs: BlocRepo, props?: T) => TemplateResult;
export function Widget<T>(widget: Widget<T>) {
  return widget;
}

export function eventToSubject<T>(subject: Subject<T>) {
  return (e: T) => {
    subject.next(e);
  };
}

export class Future<T> {
  public promise: Promise<T>;
  public resolve: (x: T) => void;
  public reject: (e: any) => void;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export async function* observableToAsyncIterable<T>(observable: Observable<T>) {
  let next = new Future();
  let done = false;
  const subscription = observable.subscribe(
    v => {
      next.resolve(v);
    },
    e => {
      next.reject(e);
    },
    () => {
      done = true;
    }
  );
  try {
    while (!done) {
      const value = await next.promise;
      next = new Future();
      yield value;
    }
  } catch (e) {
    console.log(e);
  } finally {
    subscription.unsubscribe();
  }
}
type Mapper<T, E> = (e: T, index?: number) => E;

export function asyncr<T>(o: Observable<T>, mapper?: Mapper<T, any>) {
  return asyncReplace(observableToAsyncIterable(o), mapper);
}

export type IClassConstructor<T> = new () => T;

export class BlocRepo {
  private readonly classes = new WeakMap<IClassConstructor<any>, any>();
  public of<T>(blocClass: IClassConstructor<T>): T {
    return this.classes.get(blocClass);
  }
  public register<T>(blocClass: IClassConstructor<T>, bloc?: T) {
    if (!bloc) {
      bloc = new blocClass();
    }
    this.classes.set(blocClass, bloc);
  }
}
