import { html, TemplateResult } from "lit-html";
import {
  ValvContext,
  RouterBloc,
  RouterWidget,
  makeRedirecter,
  Context,
  Widget,
  InWidgetPaginationProps,
  InWidgetMatcher,
  InWidgetPaginationMatcherHelper,
  PaginatedRouteMatcher
} from "valv";
import { HNHeader } from "./components/HNHeader";
import { HNBloc } from "./blocs/HN";
import { Top, Ask, Jobs, New, Show } from "./pages/HNFeedPages";
import { HNStoryPage } from "./pages/HNStoryPage";
import { SecretCodeBloc } from "./blocs/SecretCodeBloc";
import { SecretDemoPage } from "./pages/SecretDemoPage";
import { HNUserPageMatcher } from "./pages/HNUserPage";
import { ConfigBloc } from "./blocs/Config";
import { SafariAnimationsOverlay } from "./components/SafariAnimationsOverlay";

const context = new Context();
context.blocs.register(ConfigBloc);
context.blocs.register(RouterBloc);
context.blocs.register(HNBloc);
context.blocs.register(SecretCodeBloc);

const Home = makeRedirecter("/top/1");

const routes = {
  "/top": Top,
  "/new": New,
  "/ask": Ask,
  "/show": Show,
  "/jobs": Jobs
};
const paginatedRoutes = {
  "/story": HNStoryPage
};

type WidgetMap<T> = { [path: string]: Widget<T> };
function generateDefaultPages(context: ValvContext, routes: WidgetMap<any>) {
  const resp: { [path: string]: TemplateResult } = {};
  for (const key in routes) {
    resp[key] = makeRedirecter(key + "/1")(context);
  }
  return resp;
}
function generateFeedMatchers(
  context: ValvContext,
  routes: WidgetMap<InWidgetPaginationProps>
) {
  const matchers: any[] = [];
  for (const key in routes) {
    matchers.push(
      InWidgetMatcher(
        context,
        InWidgetPaginationMatcherHelper(key),
        routes[key]
      )
    );
  }
  return matchers;
}
export const App = html`
  ${SafariAnimationsOverlay(context)} ${HNHeader(context)}
  ${
    RouterWidget(context, {
      route$: context.blocs.of(RouterBloc).route$,
      matchers: [
        ...generateFeedMatchers(context, routes),
        PaginatedRouteMatcher(context, paginatedRoutes),
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
