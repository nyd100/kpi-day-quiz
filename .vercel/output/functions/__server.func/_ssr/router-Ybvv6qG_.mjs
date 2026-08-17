import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, j as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Ybvv6qG_.js
var router_Ybvv6qG__exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-4yHb8NCi.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "הדף לא נמצא"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "הדף שחיפשתם אינו קיים או שהועבר למקום אחר."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "חזרה למסך הכניסה"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "הדף לא נטען"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "משהו השתבש. אפשר לרענן או לחזור למסך הכניסה."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "נסו שוב"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "מסך הכניסה"
					})]
				})
			]
		})
	});
}
var Route$5 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ממספרים לאימפקט – כניסה למשחק" },
			{
				name: "description",
				content: "הצטרפו לחידון החי של סיכום חציון א' 2026 באמצעות קוד משחק בן ארבע ספרות."
			},
			{
				property: "og:title",
				content: "ממספרים לאימפקט – כניסה למשחק"
			},
			{
				property: "og:description",
				content: "הצטרפו לחידון החי של סיכום חציון א' 2026 באמצעות קוד משחק בן ארבע ספרות."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "ממספרים לאימפקט – כניסה למשחק"
			},
			{
				name: "twitter:description",
				content: "הצטרפו לחידון החי של סיכום חציון א' 2026 באמצעות קוד משחק בן ארבע ספרות."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/077441fb25a140c1c92c0d92f0e25837/id-preview-f3b6222a--d76cdc1b-5410-4a29-835b-731681f34a72.lovable.app-1786450892695.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/077441fb25a140c1c92c0d92f0e25837/id-preview-f3b6222a--d76cdc1b-5410-4a29-835b-731681f34a72.lovable.app-1786450892695.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Heebo:wght@500;700;900&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.png",
				type: "image/png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "he",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$5.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-center",
			richColors: true
		})]
	});
}
var $$splitComponentImporter$3 = () => import("./routes-BQ6B9yT3.mjs");
var Route$4 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "ממספרים לאימפקט – כניסה למשחק" },
		{
			name: "description",
			content: "הצטרפו לחידון החי של סיכום חציון א' 2026 באמצעות קוד משחק בן ארבע ספרות."
		},
		{
			property: "og:title",
			content: "ממספרים לאימפקט – כניסה למשחק"
		},
		{
			property: "og:description",
			content: "הצטרפו לחידון החי של סיכום חציון א' 2026 באמצעות קוד משחק בן ארבע ספרות."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin-BHtx5FhQ.mjs");
var Route$3 = createFileRoute("/admin")({
	head: () => ({ meta: [
		{ title: "קונסולת ניהול – ממספרים לאימפקט" },
		{
			name: "description",
			content: "עריכת שאלות החידון, תמונות למסך הגדול ופתיחת משחק חדש."
		},
		{
			property: "og:title",
			content: "קונסולת ניהול – ממספרים לאימפקט"
		},
		{
			property: "og:description",
			content: "עריכת שאלות החידון, תמונות למסך הגדול ופתיחת משחק חדש."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var Route$2 = createFileRoute("/host")({ beforeLoad: () => {
	throw redirect({ to: "/present" });
} });
var $$splitComponentImporter$1 = () => import("./play-BCyzmLZN.mjs");
var Route$1 = createFileRoute("/play")({
	head: () => ({ meta: [
		{ title: "ממספרים לאימפקט – מסך המשתתף" },
		{
			name: "description",
			content: "מסך המשתתף בחידון החי: שאלות, טיימר ותשובות בזמן אמת."
		},
		{
			property: "og:title",
			content: "ממספרים לאימפקט – מסך המשתתף"
		},
		{
			property: "og:description",
			content: "מסך המשתתף בחידון החי: שאלות, טיימר ותשובות בזמן אמת."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./present-mt1g0mbi.mjs");
var Route = createFileRoute("/present")({
	head: () => ({ meta: [
		{ title: "ממספרים לאימפקט – מסך המשחק החי" },
		{
			name: "description",
			content: "מסך ההנחיה החי לניהול החידון והצגתו על המסך הגדול."
		},
		{
			property: "og:title",
			content: "ממספרים לאימפקט – מסך המשחק החי"
		},
		{
			property: "og:description",
			content: "מסך ההנחיה החי לניהול החידון והצגתו על המסך הגדול."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	AdminRoute: Route$3.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$5
	}),
	HostRoute: Route$2.update({
		id: "/host",
		path: "/host",
		getParentRoute: () => Route$5
	}),
	PlayRoute: Route$1.update({
		id: "/play",
		path: "/play",
		getParentRoute: () => Route$5
	}),
	PresentRoute: Route.update({
		id: "/present",
		path: "/present",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter, router_Ybvv6qG__exports as t };
