import { html } from "lit-html";
import { PartialObserver, Observable, Subject, from, defer } from "rxjs";
import "@polymer/paper-button/paper-button.js";
import { awaito, Widget, RouterBloc, PaginatedRouteProps, just } from "valv";
import { mapTo, map } from "rxjs/operators";
import { StoryList } from "../components/StoryList";
import { HNHeader } from "../components/HNHeader";
import { HNBloc, HNFeed } from "../blocs/HN";
import { Button } from "../components/Button";
import "@polymer/paper-styles/paper-styles-classes";
import { paperMaterial } from "../styles";

function makeHNPage(feed: HNFeed) {
  return Widget((context, { page }: PaginatedRouteProps<any>) => {
    const hnbloc = context.blocs.of(HNBloc);
    const router = context.blocs.of(RouterBloc);
    const next = new Subject();
    const previous = new Subject();

    next.pipe(mapTo(+1)).subscribe(router.paginationDeltaObserver);

    previous.pipe(mapTo(-1)).subscribe(router.paginationDeltaObserver);

    return html`
      <custom-style>
        <style is="custom-style" include="paper-material-styles">
          ${paperMaterial}
        </style>
      </custom-style>
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
