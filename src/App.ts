import { html, TemplateResult } from "lit-html";
import {
  ValvContext,
  RouterBloc,
  RouterWidget,
  PageFactoryMap,
  PaginatedRouteMatcher,
  makeRedirecter,
  Context
} from "valv";
import { HNHeader } from "./components/HNHeader";
import { HNBloc } from "./blocs/HN";
import { Top, Ask, Jobs, New, Show } from "./pages/HNFeedPages";
import { HNStoryPage } from "./pages/HNStoryPage";
import { SecretCodeBloc } from "./blocs/SecretCodeBloc";
import { SecretDemoPage } from "./pages/SecretDemoPage";
import { HNUserPageMatcher } from "./pages/HNUserPage";

const context = new Context();
context.blocs.register(RouterBloc);
context.blocs.register(HNBloc);
context.blocs.register(SecretCodeBloc);

const Home = makeRedirecter("/top");

const routes: PageFactoryMap<any> = {
  "/top": Top,
  "/new": New,
  "/ask": Ask,
  "/show": Show,
  "/jobs": Jobs,
  "/story": HNStoryPage
};

function generateDefaultPages(
  context: ValvContext,
  routes: PageFactoryMap<any>
) {
  const resp: { [path: string]: TemplateResult } = {};
  for (const key in routes) {
    resp[key] = makeRedirecter(key + "/1")(context);
  }
  return resp;
}
export const App = html`
  ${HNHeader(context)}
  ${
    RouterWidget(context, {
      routeObservable: context.blocs.of(RouterBloc).routeObservable,
      matchers: [
        PaginatedRouteMatcher(context, routes),
        HNUserPageMatcher(context)
      ],
      routes: {
        "/": Home(context),
        "/secret": SecretDemoPage(context),
        ...generateDefaultPages(context, routes)
      }
    })
  }
`;
