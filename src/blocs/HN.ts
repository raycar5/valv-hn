import {
  Observable,
  PartialObserver,
  BehaviorSubject,
  from,
  Subject
} from "rxjs";
import { map, switchMap, startWith, mapTo } from "rxjs/operators";

export interface HNStory {
  id: number;
  content?: string;
  title: string;
  url: string;
  domain?: string;
  time_ago: string;
  comments_count: number;
  user: string;
  points: number;
}

export interface IHNComment {
  id: number;
  level: number;
  user: string;
  time_ago: string;
  content: string;
  comments: IHNComment[];
}

export interface HNStoryAndComments extends HNStory {
  comments: IHNComment[];
}

export interface HNUser {
  id: string;
  created: string;
  karma: number;
  about: string;
}

export enum LoadStatus {
  LOADING,
  LOADED,
  ERROR
}

export interface HNStoryMessage {
  loadStatus: LoadStatus;
  story?: HNStoryAndComments;
}
export interface HNUserMessage {
  loadStatus: LoadStatus;
  user?: HNUser;
}

export enum HNFeed {
  TOP = "news",
  NEW = "newest",
  ASK = "ask",
  SHOW = "show",
  JOBS = "jobs"
}
interface FeedSelector {
  feed: HNFeed;
  page: number;
}
export interface HNStoryPage {
  stories: HNStory[];
  pageNumber: number;
}
export interface HNStoryPageMessage {
  loadStatus: LoadStatus;
  page?: HNStoryPage;
}
export class HNBloc {
  public readonly feed$: Observable<HNStoryPageMessage>;
  public readonly $feedSelector: PartialObserver<FeedSelector>;

  public readonly story$: Observable<HNStoryMessage>;
  public readonly $storySelector: PartialObserver<number>;

  public readonly user$: Observable<HNUserMessage>;
  public readonly $userSelector: PartialObserver<string>;

  constructor() {
    const $feed$ = new BehaviorSubject<HNStoryPageMessage>({
      loadStatus: LoadStatus.LOADING
    });
    //Setup
    this.feed$ = $feed$;
    const $feedSelector$ = new Subject<FeedSelector>();
    this.$feedSelector = $feedSelector$;

    const $story = new BehaviorSubject<HNStoryMessage>({
      loadStatus: LoadStatus.LOADING
    });
    this.story$ = $story;

    const $storySelector$ = new Subject<number>();
    this.$storySelector = $storySelector$;

    const $user$ = new BehaviorSubject<HNUserMessage>({
      loadStatus: LoadStatus.LOADING
    });
    this.user$ = $user$;

    const $userSelector$ = new Subject<string>();
    this.$userSelector = $userSelector$;

    //Logic
    $feedSelector$
      .pipe(
        switchMap(f =>
          from(
            fetch(`https://node-hnapi.herokuapp.com/${f.feed}?page=${f.page}`)
              .then(async response => ({
                loadStatus: LoadStatus.LOADED,
                page: {
                  stories: await response.json(),
                  pageNumber: f.page
                }
              }))
              .catch(error => {
                console.error("error fetching story from hackernews api");
                return Promise.resolve({
                  loadStatus: LoadStatus.ERROR
                });
              })
          ).pipe(startWith({ loadStatus: LoadStatus.LOADING }))
        )
      )
      .subscribe($feed$);

    $storySelector$
      .pipe(
        switchMap(f =>
          from(
            fetch(`https://node-hnapi.herokuapp.com/item/${f}`)
              .then(async response => ({
                story: await response.json(),
                loadStatus: LoadStatus.LOADED
              }))
              .catch(error => {
                console.error("error fetching story from hackernews api");
                return Promise.resolve({
                  loadStatus: LoadStatus.ERROR
                });
              })
          ).pipe(startWith({ loadStatus: LoadStatus.LOADING }))
        )
      )
      .subscribe($story);

    $userSelector$
      .pipe(
        switchMap(f =>
          from(
            fetch(`https://node-hnapi.herokuapp.com/user/${f}`)
              .then(async response => ({
                user: await response.json(),
                loadStatus: LoadStatus.LOADED
              }))
              .catch(error => {
                console.error("error fetching story from hackernews api");
                return Promise.resolve({
                  loadStatus: LoadStatus.ERROR
                });
              })
          ).pipe(startWith({ loadStatus: LoadStatus.LOADING }))
        )
      )
      .subscribe($user$);
  }
}
