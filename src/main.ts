import { render, html, TemplateResult } from "lit-html";
import {
  defer,
  BehaviorSubject,
  Subject,
  Observable,
  PartialObserver,
  Subscription
} from "rxjs";
import { map, flatMap, mapTo, merge, scan, take } from "rxjs/operators";
import {
  asynco,
  eventToObserver,
  BlocRepo,
  Widget,
  RouterBloc,
  RouterWidget,
  just,
  interact,
  PageFactoryMap,
  PaginatedRouteProps,
  PaginatedRouteMatcher,
  makeRedirecter
} from "./lit-rx";
import { HNHeader } from "./components/HNHeader";
import { HNBloc } from "./blocs/HN";
import { Top, Ask, Jobs, New, Show } from "./pages/HNFeedPages";
import { HNStoryPage } from "./pages/HNStoryPage";
import { SecretCodeBloc } from "./blocs/SecretCodeBloc";
import { SecretDemoPage } from "./pages/SecretDemoPage";

const blocs = new BlocRepo();
blocs.register(RouterBloc);
blocs.register(HNBloc);
blocs.register(SecretCodeBloc);

const Home = makeRedirecter("/top");

const routes: PageFactoryMap = {
  "/top": Top,
  "/new": New,
  "/ask": Ask,
  "/show": Show,
  "/jobs": Jobs,
  "/story": HNStoryPage
};

function generateDefaultPages(blocs: BlocRepo, routes: PageFactoryMap) {
  const resp: { [path: string]: TemplateResult } = {};
  for (const key in routes) {
    resp[key] = makeRedirecter(key + "/1")(blocs);
  }
  return resp;
}

const App = html`
  ${HNHeader(blocs)}
  ${
    RouterWidget(blocs, {
      routeObservable: blocs.of(RouterBloc).routeObservable,
      matchers: [PaginatedRouteMatcher(blocs, routes)],
      routes: {
        "/": Home(blocs),
        "/secret": SecretDemoPage(blocs),
        ...generateDefaultPages(blocs, routes)
      }
    })
  }
`;

render(App, document.getElementById("body"));
