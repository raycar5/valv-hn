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
export class HNBloc {
  public readonly storiesObservable: Observable<HNStoryPage>;
  public readonly feedSelectorObserver: PartialObserver<FeedSelector>;

  public readonly storyObservable: Observable<HNStoryMessage>;
  public readonly storySelectorObserver: PartialObserver<number>;

  public readonly userObservable: Observable<HNUserMessage>;
  public readonly userSelectorObserver: PartialObserver<string>;

  constructor() {
    const storiesSubject = new BehaviorSubject<HNStoryPage>({
      stories: [],
      pageNumber: 1
    });
    //Setup
    this.storiesObservable = storiesSubject;
    const feedSelectorSubject = new Subject<FeedSelector>();
    this.feedSelectorObserver = feedSelectorSubject;

    const storySubject = new BehaviorSubject<HNStoryMessage>({
      loadStatus: LoadStatus.LOADING
    });
    this.storyObservable = storySubject;

    const storySelectorSubject = new Subject<number>();
    this.storySelectorObserver = storySelectorSubject;

    const userSubject = new BehaviorSubject<HNUserMessage>({
      loadStatus: LoadStatus.LOADING
    });
    this.userObservable = userSubject;

    const userSelectorSubject = new Subject<string>();
    this.userSelectorObserver = userSelectorSubject;

    //Logic
    feedSelectorSubject
      .pipe(
        switchMap(f =>
          from(
            fetch(
              `https://node-hnapi.herokuapp.com/${f.feed}?page=${f.page}`
            ).then(async response => ({
              stories: await response.json(),
              pageNumber: f.page
            }))
          )
        )
      )
      .subscribe(storiesSubject);

    storySelectorSubject
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
      .subscribe(storySubject);

    userSelectorSubject
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
      .subscribe(userSubject);
  }
}
