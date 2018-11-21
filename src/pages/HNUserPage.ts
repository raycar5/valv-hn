import { Widget, awaito, ValvContext } from "valv";
import { html } from "lit-html";
import { HNBloc, LoadStatus } from "../blocs/HN";
import { defer } from "rxjs";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import { Spinner } from "../components/Spinner";

export function HNUserPageMatcher(context: ValvContext) {
  return (path: string) => {
    const regex = /^\/user\/([^\s\/]+)\/?$/; //probably not good enough regex but oh well
    const match = regex.exec(path);
    if (!match || !match[1]) {
      return undefined;
    }
    return HNUserPage(context, match[1]);
  };
}

export const HNUserPage = Widget((context, user: string) => {
  const hnbloc = context.blocs.of(HNBloc);
  return html`
    ${
      awaito(
        defer(() => {
          hnbloc.userSelectorObserver.next(user);
        })
      )
    }
    <div class="paper-material">
      ${
        awaito(hnbloc.userObservable, userMessage => {
          switch (userMessage.loadStatus) {
            case LoadStatus.ERROR:
              return `
                Error :(
              `;
            case LoadStatus.LOADING:
              return html`
                <div
                  style="position:fixed; top: 50%; left:50%; transform: translate(-50%, -50%);"
                >
                  ${Spinner(context)}
                </div>
              `;
            case LoadStatus.LOADED:
              const { created, karma, about } = userMessage.user;
              return html`
                <div style="margin: 10px">
                  <div>User: ${user}</div>
                  <div>Created: ${created}</div>
                  <div>Karma: ${karma}</div>
                  <div>${unsafeHTML(about)}</div>
                  <div>
                    <a href="https://news.ycombinator.com/submitted?id=${user}">
                      submitted</a
                    >
                    |
                    <a href="https://news.ycombinator.com/threads?id=${user}">
                      comments</a
                    >
                    |
                    <a href="https://news.ycombinator.com/favorites?id=${user}">
                      favorites
                    </a>
                  </div>
                </div>
              `;
          }
        })
      }
    </div>
  `;
});
