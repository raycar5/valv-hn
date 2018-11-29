import { html } from "lit-html";
import { Subject, defer, never } from "rxjs";
import {
  awaito,
  Widget,
  RouterBloc,
  PaginatedRouteProps,
  just,
  InWidgetPaginationProps
} from "valv";
import { mapTo, map, auditTime, merge, tap } from "rxjs/operators";
import { StoryList } from "../components/StoryList";
import { HNBloc, HNFeed } from "../blocs/HN";
import { Button } from "../components/Button";

function makeHNPage(feed: HNFeed) {
  return Widget((context, { page$ }: InWidgetPaginationProps) => {
    const hnbloc = context.blocs.of(HNBloc);
    const router = context.blocs.of(RouterBloc);
    const next = new Subject();
    const previous = new Subject();

    next.pipe(mapTo(+1)).subscribe(router.$paginationDelta);

    previous.pipe(mapTo(-1)).subscribe(router.$paginationDelta);
    page$
      .pipe(
        auditTime(0),
        map(({ page }) => ({ feed, page })),
        merge(never()) // never complete
      )
      .subscribe(hnbloc.$feedSelector);

    return html`
      <div>
        <div
          style="display: flex; justify-content: space-between; margin:10px; "
        >
          <div
            style="${
              awaito(page$, page =>
                page.page > 1 ? "visibility:visible" : "visibility:hidden"
              )
            }"
          >
            ${
              Button(context, {
                text$: just("Previous"),
                $event: previous
              })
            }
          </div>
          ${
            Button(context, {
              text$: just("Next"),
              $event: next
            })
          }
        </div>
        ${
          StoryList(context, {
            storyPage$: hnbloc.feed$
          })
        }
      </div>
    `;
  });
}
export const Top = makeHNPage(HNFeed.TOP);
export const New = makeHNPage(HNFeed.NEW);
export const Ask = makeHNPage(HNFeed.ASK);
export const Show = makeHNPage(HNFeed.SHOW);
export const Jobs = makeHNPage(HNFeed.JOBS);
