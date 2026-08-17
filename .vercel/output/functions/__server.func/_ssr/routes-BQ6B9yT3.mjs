import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as validatePin, u as validateName } from "./quiz-ak5S6P9L.mjs";
import { a as joinGame, f as useHydrated, s as playerStorage } from "./use-game-Dnag8lgq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BQ6B9yT3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function JoinPage() {
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const [pin, setPin] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [existing, setExisting] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const stored = playerStorage.get();
		if (stored) setExisting({
			pin: stored.pin,
			displayName: stored.displayName
		});
	}, []);
	const onSubmit = async (event) => {
		event.preventDefault();
		if (!validatePin(pin)) {
			toast.error("קוד המשחק חייב להיות בן 4 ספרות.");
			return;
		}
		const nameError = validateName(name);
		if (nameError) {
			toast.error(nameError);
			return;
		}
		setBusy(true);
		try {
			const identity = await joinGame({ data: {
				pin,
				displayName: name
			} });
			playerStorage.set(identity);
			await navigate({ to: "/play" });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "ההצטרפות נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-screen flex-col items-center justify-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mb-6 w-full max-w-xs rounded-2xl bg-white p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/strategy-division-logo.png",
								alt: "חטיבת אסטרטגיה ותכנון מדיניות",
								className: "h-auto w-full object-contain"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-sm font-semibold tracking-widest text-primary",
							children: "סיכום חציון א' 2026"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-5xl font-black leading-tight",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient-accent",
								children: "ממספרים לאימפקט"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-muted-foreground",
							children: "חידון חי – הצטרפו מהטלפון"
						})
					]
				}),
				hydrated && existing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card mb-4 flex items-center justify-between gap-3 p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: ["יש חיבור פעיל בשם ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-foreground",
							children: existing.displayName
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/play",
						className: "rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground",
						children: "חזרה למשחק"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "surface-card space-y-5 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "pin",
							className: "mb-2 block text-sm font-semibold",
							children: "קוד משחק"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "pin",
							inputMode: "numeric",
							autoComplete: "off",
							maxLength: 4,
							value: pin,
							onChange: (e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4)),
							placeholder: "0000",
							dir: "ltr",
							className: "tabular h-16 w-full rounded-2xl border border-input bg-background/60 text-center text-4xl font-black tracking-[0.4em] text-foreground placeholder:text-muted-foreground/40"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "name",
							className: "mb-2 block text-sm font-semibold",
							children: "שם"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "name",
							value: name,
							maxLength: 24,
							onChange: (e) => setName(e.target.value),
							placeholder: "השם שיוצג במשחק",
							className: "h-14 w-full rounded-2xl border border-input bg-background/60 px-4 text-lg font-semibold text-foreground placeholder:text-muted-foreground/60"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "h-14 w-full rounded-2xl bg-gradient-accent text-lg font-bold text-primary-foreground transition-transform active:scale-[0.99] disabled:opacity-60",
							children: busy ? "מצטרפים..." : "כניסה למשחק"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-center text-xs text-muted-foreground",
					children: "המתינו להוראות המנחה על המסך הגדול."
				})
			]
		})
	});
}
//#endregion
export { JoinPage as component };
