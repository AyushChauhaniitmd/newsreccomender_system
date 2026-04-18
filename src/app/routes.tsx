import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ArticlePage } from "./pages/ArticlePage";
import { ExplorePage } from "./pages/ExplorePage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "about", Component: AboutPage },
      { path: "explore", Component: ExplorePage },
      { path: "contact", Component: ContactPage },
      { path: "article/:id", Component: ArticlePage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
