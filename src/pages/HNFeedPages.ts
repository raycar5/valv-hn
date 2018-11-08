import { html } from "lit-html";
import { PartialObserver, Observable, Subject, from, defer } from "rxjs";
import "@polymer/paper-button/paper-button.js";
import {
  asynco,
  eventToObserver,
  Widget,
  RouterBloc,
  PaginatedRouteProps,
  just
} from "../lit-rx";
import { mapTo, map } from "rxjs/operators";
import { StoryList } from "../components/StoryList";
import { HNHeader } from "../components/HNHeader";
import { HNBloc, HNFeed } from "../blocs/HN";
import { Button } from "../components/Button";
import "@polymer/paper-styles/paper-styles-classes";

function makeHNPage(feed: HNFeed) {
  return Widget((blocs, { page }: PaginatedRouteProps) => {
    const hnbloc = blocs.of(HNBloc);
    const router = blocs.of(RouterBloc);
    const next = new Subject();
    const previous = new Subject();

    next.pipe(mapTo(+1)).subscribe(router.paginationDeltaObserver);

    previous.pipe(mapTo(-1)).subscribe(router.paginationDeltaObserver);

    return html`
      <custom-style>
        <style is="custom-style" include="paper-material-styles">
          .paper-material {
            padding: 5px;
            margin: 10px 20%;
            @apply --shadow-elevation-4dp;
          }
        </style>
      </custom-style>
      ${
        asynco(
          defer(() => {
            hnbloc.feedSelectorObserver.next({ feed, page });
          })
        )
      }
      ${HNHeader(blocs)}
      <div class="paper-material">
        ${
          StoryList(blocs, {
            storyPages: hnbloc.storiesObservable
          })
        }
        <div style="display:flex; justify-content: space-between; margin: 10px">
          ${
            page > 1
              ? Button(blocs, {
                  textObservable: just("Previous"),
                  eventObserver: previous
                })
              : html`
                  <div></div>
                `
          }
          ${
            Button(blocs, {
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
