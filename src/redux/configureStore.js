import { createBrowserHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "connected-react-router";
import createRootReducer from "./reducers";
import thunk from "redux-thunk";
import reduxImmutableStateInvariant from "redux-immutable-state-invariant";

export const history = createBrowserHistory();

export default function configureStore(preloadedState) {
    const middlewares = [thunk, routerMiddleware(history)];

    if (process.env.NODE_ENV !== "production") {
        middlewares.unshift(reduxImmutableStateInvariant());
    }

    const composeEnhancers =
        typeof window === "object" &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                  trace: true,
                  shouldHotReload: false,
                  shouldCatchErrors: true,
                  /* predicate: (state, action) => { return true;} */
              })
            : compose;

    const store = createStore(
        createRootReducer(history), // root reducer with router state
        /* preloadedState, */
        composeEnhancers(applyMiddleware(...middlewares))
    );

    if (window.Cypress) {
        window.store = store;
    }

    window.store = store;

    return store;
}
