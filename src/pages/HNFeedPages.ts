import { html } from "lit-html";
import { Subject, defer } from "rxjs";
import { awaito, Widget, RouterBloc, PaginatedRouteProps, just } from "valv";
import { mapTo } from "rxjs/operators";
import { StoryList } from "../components/StoryList";
import { HNBloc, HNFeed } from "../blocs/HN";
import { Button } from "../components/Button";

function makeHNPage(feed: HNFeed) {
  return Widget((context, { page }: PaginatedRouteProps<any>) => {
    const hnbloc = context.blocs.of(HNBloc);
    const router = context.blocs.of(RouterBloc);
    const next = new Subject();
    const previous = new Subject();

    next.pipe(mapTo(+1)).subscribe(router.paginationDeltaObserver);

    previous.pipe(mapTo(-1)).subscribe(router.paginationDeltaObserver);

    return html`
      ${
        awaito(
          defer(() => {
            hnbloc.feedSelectorObserver.next({ feed, page });
          })
        )
      }
      <div class="paper-material">
        ${
          StoryList(context, {
            storyPages: hnbloc.storiesObservable
          })
        }
        <div style="display:flex; justify-content: space-between; margin: 10px">
          ${
            page > 1
              ? Button(context, {
                  textObservable: just("Previous"),
                  eventObserver: previous
                })
              : html`
                  <div></div>
                `
          }
          ${
            Button(context, {
              textObservable: just("Next"),
              eventObserver: next
            })
          }
        </div>
      </div>
    `;
  });
}
export const Top = makeHNPage(HNFeed.TOP);
export const New = makeHNPage(HNFeed.NEW);
export const Ask = makeHNPage(HNFeed.ASK);
export const Show = makeHNPage(HNFeed.SHOW);
export const Jobs = makeHNPage(HNFeed.JOBS);
