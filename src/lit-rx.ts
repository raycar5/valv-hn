import {
  Observable,
  Subject,
  BehaviorSubject,
  of,
  PartialObserver,
  NextObserver,
  defer
} from "rxjs";
import { combineLatest, map, delay, debounceTime } from "rxjs/operators";
import { TemplateResult, directive, NodePart, Directive, html } from "lit-html";

export type Widget<T> = (blocs: BlocRepo, props?: T) => TemplateResult;
export function Widget<T>(widget: Widget<T>) {
  return widget;
}

type Mapper<T, E> = (e: T, index?: number) => E;
export function eventToObserver<T, E>(
  subject: PartialObserver<E | T>,
  mapper?: Mapper<T, E>
): (e: T) => void {
  if (mapper) {
    return (e: T) => {
      subject.next(mapper(e));
    };
  }
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

export const asynco = <T>(
  value: Observable<T>,
  mapper?: Mapper<T, any>
): Directive<NodePart> =>
  directive(async (part: NodePart) => {
    // If we've already set up this particular observable, we don't need
    // to do anything.
    if (value === part.value) {
      return;
    }

    // We nest a new part to keep track of previous item values separately
    // of the iterable as a value itself.
    const itemPart = new NodePart(part.options);
    part.value = value;

    let i = 0;
    let next = new Future<T>();
    let done = false;
    const subscription = value.subscribe(
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
      part.clear();
      itemPart.appendIntoPart(part);
      let i = 0;
      while (!done) {
        let v = await next.promise;
        if (part.value != value) break;
        next = new Future<T>();
        if (mapper !== undefined) {
          v = mapper(v, i);
        }
        itemPart.setValue(v);
        itemPart.commit();
        i++;
      }
    } catch (e) {
      console.log(e);
    } finally {
      subscription.unsubscribe();
    }
  });
interface AnimateOptions<T> {
  keyframes: Keyframe[] | PropertyIndexedKeyframes;
  options?: KeyframeAnimationOptions;
  autoplay?: boolean;
  controlObservable?: Observable<T>;
  controlCallback?: (value: T, animation: Animation) => void;
}
export const animate = <T, E>(
  value: T | TemplateResult,
  {
    keyframes,
    options,
    autoplay = false,
    controlObservable,
    controlCallback
  }: AnimateOptions<E>
) =>
  directive(async (part: NodePart) => {
    const itemPart = new NodePart(part.options);
    part.value = value;
    part.clear();
    itemPart.appendIntoPart(part);
    itemPart.setValue(value);
    itemPart.commit();

    const animation = ((itemPart.startNode as unknown) as NonDocumentTypeChildNode).nextElementSibling.animate(
      keyframes,
      options
    );
    if (!autoplay) animation.pause();
    if (!controlObservable) {
      return;
    }
    let next = new Future<E>();
    let done = false;
    const subscription = controlObservable.subscribe(
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
      await new Promise(resolve => setImmediate(resolve));

      while (!done) {
        let v = await next.promise;
        if (part.value != value) break;
        next = new Future<E>();
        controlCallback(v, animation);
      }
    } catch (e) {
      console.log(e);
    } finally {
      subscription.unsubscribe();
    }
  });

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

export class RouterBloc {
  public readonly nextObserver: PartialObserver<string>;
  public readonly backObserver: PartialObserver<any>;
  public readonly routeObservable: Observable<string>;
  public readonly paginationDeltaObserver: PartialObserver<number>;
  constructor() {
    // Setup
    const routeSubject = new BehaviorSubject(window.location.pathname);
    this.routeObservable = routeSubject;

    this.nextObserver = {
      next(path) {
        window.history.pushState({}, path, window.location.origin + path);
        routeSubject.next(path);
      }
    };

    this.backObserver = {
      next() {
        window.history.back();
        routeSubject.next(window.location.pathname);
      }
    };

    window.onpopstate = function(e) {
      routeSubject.next(window.location.pathname);
    };
    this.paginationDeltaObserver = {
      next(pageDelta) {
        const r = /((?:\/\w+)+\/)(?:(\d+))/;
        const match = r.exec(window.location.pathname);
        if (!match || match[1] === undefined || match[2] === undefined) {
          console.error(
            "called paginationDeltaObserver in a non paginated route"
          );
          return;
        }
        const path = match[1] + (parseInt(match[2]) + pageDelta);
        window.history.pushState({}, path, window.location.origin + path);
        routeSubject.next(path);
      }
    };
  }
}
type PathMatcher = (ath: string) => TemplateResult | undefined;
export interface RouterProps {
  routeObservable: Observable<string>;
  matchers?: Array<PathMatcher>;
  routes?: { [path: string]: TemplateResult };
  notFoundRoute?: TemplateResult;
}
export const RouterWidget = Widget(
  (
    blocs,
    {
      routeObservable,
      matchers = [],
      routes = {},
      notFoundRoute = html`
        404
      `
    }: RouterProps
  ) => {
    return html`
      ${
        asynco(routeObservable, path => {
          for (const matcher of matchers) {
            const template = matcher(path);
            if (template) return template;
          }
          const template = routes[path];
          if (template) return template;
          return notFoundRoute;
        })
      }
    `;
  }
);

export function just<T>(v: T) {
  return of(v).pipe(delay(0));
}

export interface PaginatedRouteProps {
  page: number;
}
export interface PageFactoryMap {
  [path: string]: Widget<PaginatedRouteProps>;
}
export function PaginatedRouteMatcher(blocs: BlocRepo, routes: PageFactoryMap) {
  return function(path: string) {
    const r = /((?:\/\w+)+)\/(.*)/;
    const results = r.exec(path);
    if (!results || !results[0]) return undefined;
    const route = routes[results[1]];
    if (!route) return undefined;
    return route(blocs, { page: parseInt(results[2] ? results[2] : "1") });
  };
}
export function makeRedirecter(path: string) {
  return Widget(blocs => {
    const o = defer(() => {
      blocs.of(RouterBloc).nextObserver.next(path);
    });
    return html`
      ${asynco(o)}
    `;
  });
}
