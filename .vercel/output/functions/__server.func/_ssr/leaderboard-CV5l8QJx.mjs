import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as sortLeaderboard, n as ANSWER_META } from "./quiz-ak5S6P9L.mjs";
import { t as connectionLabel } from "./use-game-Dnag8lgq.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leaderboard-CV5l8QJx.js
var import_jsx_runtime = require_jsx_runtime();
function AnswerShape({ id, className = "" }) {
	const { shape } = ANSWER_META[id];
	const common = { fill: "currentColor" };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		className,
		children: [
			shape === "square" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "4",
				y: "4",
				width: "16",
				height: "16",
				rx: "2",
				...common
			}),
			shape === "circle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "8.5",
				...common
			}),
			shape === "triangle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: "12,3.5 21,20 3,20",
				...common
			}),
			shape === "diamond" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: "12,2.5 21.5,12 12,21.5 2.5,12",
				...common
			})
		]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function AnswerTile({ id, text, onSelect, disabled, selected, dimmed, correct, size = "player" }) {
	const meta = ANSWER_META[id];
	const isButton = typeof onSelect === "function";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(isButton ? "button" : "div", {
		...isButton ? {
			type: "button",
			onClick: onSelect,
			disabled
		} : {},
		"aria-label": `תשובה ${id} · ${meta.shapeLabel} · ${text}`,
		"aria-pressed": isButton ? !!selected : void 0,
		style: { backgroundColor: meta.color },
		className: cn("relative flex w-full items-center gap-3 rounded-2xl px-4 text-start transition-all duration-200", "text-primary-foreground", size === "player" ? "min-h-[86px] py-3" : "min-h-[104px] py-4", isButton && !disabled && "hover:brightness-110 active:scale-[0.98]", selected && "ring-4 ring-accent", correct && "ring-4 ring-success", dimmed && "opacity-40 saturate-50"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-11 shrink-0 place-items-center rounded-xl bg-foreground/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnswerShape, {
					id,
					className: "size-6 text-primary-foreground"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("flex-1 font-semibold leading-snug text-primary-foreground", size === "player" ? "text-[17px]" : "text-2xl"),
				style: { color: "oklch(0.99 0 0)" },
				children: text
			}),
			correct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-lg bg-success px-2 py-1 text-xs font-bold text-success-foreground",
				children: "התשובה הנכונה"
			})
		]
	});
}
function ConnectionBadge({ state }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground",
		role: "status",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", state === "connected" && "bg-success", state === "connecting" && "bg-accent", state === "reconnecting" && "bg-accent", state === "offline" && "bg-destructive") }), connectionLabel(state)]
	});
}
function Countdown({ seconds, ratio, size = 120 }) {
	const urgent = seconds <= 5 && seconds > 0;
	const radius = 46;
	const circumference = 2 * Math.PI * radius;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative shrink-0", urgent && "animate-pulse-urgent"),
		style: {
			width: size,
			height: size
		},
		role: "timer",
		"aria-live": "off",
		"aria-label": `נותרו ${seconds} שניות`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 100 100",
			className: "size-full -rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: radius,
				className: "fill-none stroke-border",
				strokeWidth: "8"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: radius,
				className: cn("fill-none transition-[stroke-dashoffset] duration-200", urgent ? "stroke-destructive" : "stroke-primary"),
				strokeWidth: "8",
				strokeLinecap: "round",
				strokeDasharray: circumference,
				strokeDashoffset: circumference * (1 - ratio)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("tabular absolute inset-0 grid place-items-center text-3xl font-bold", urgent ? "text-destructive" : "text-foreground"),
			children: seconds
		})]
	});
}
var MEDALS = [
	"🥇",
	"🥈",
	"🥉"
];
function LeaderboardList({ players, limit = 10, highlightPlayerId, compact = false }) {
	const ranked = sortLeaderboard(players).slice(0, limit);
	if (ranked.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-center text-muted-foreground",
		children: "עדיין אין נקודות להצגה."
	});
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-2",
		children: ranked.map((player, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: cn("surface-card animate-rise flex items-center gap-3 px-4 py-2", highlightPlayerId === player.id && "ring-2 ring-accent"),
			style: { animationDelay: `${index * 60}ms` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/10 font-bold text-sm",
					children: index < 3 ? MEDALS[index] : index + 1
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate font-semibold text-sm",
					children: player.display_name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular font-bold text-sm",
					children: player.total_score.toLocaleString("he-IL")
				})
			]
		}, player.id))
	});
	const top3 = ranked.slice(0, 3);
	const rest = ranked.slice(3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6 w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-3",
			children: top3.map((player, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("surface-card animate-rise flex flex-col items-center justify-center gap-3 p-6 text-center shadow-lg", index === 0 && "bg-gradient-accent text-accent-foreground scale-105 z-10", highlightPlayerId === player.id && "ring-4 ring-accent"),
				style: { animationDelay: `${index * 150}ms` },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-6xl mb-2",
						children: MEDALS[index]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate w-full text-2xl font-black",
						children: player.display_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular text-3xl font-bold",
						children: player.total_score.toLocaleString("he-IL")
					})
				]
			}, player.id))
		}), rest.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "grid gap-x-8 gap-y-3 sm:grid-cols-2 mt-4 bg-muted/30 p-6 rounded-3xl",
			children: rest.map((player, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("animate-rise flex items-center gap-4 rounded-xl bg-background p-3 shadow-sm", highlightPlayerId === player.id && "ring-2 ring-accent"),
				style: { animationDelay: `${(index + 3) * 60}ms` },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular grid size-10 shrink-0 place-items-center rounded-xl bg-muted font-black text-muted-foreground",
						children: index + 4
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate font-semibold text-lg",
						children: player.display_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular font-bold text-lg text-primary",
						children: player.total_score.toLocaleString("he-IL")
					})
				]
			}, player.id))
		})]
	});
}
function Podium({ players }) {
	const top = sortLeaderboard(players).slice(0, 3);
	const order = [
		1,
		0,
		2
	];
	const heights = [
		"h-28",
		"h-40",
		"h-20"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-end justify-center gap-4",
		children: order.map((position, slot) => {
			const player = top[position];
			if (!player) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-32" }, slot);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-40 flex-col items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-4xl",
						children: MEDALS[position]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-2 text-center text-lg font-bold",
						children: player.display_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular text-2xl font-black text-primary",
						children: player.total_score.toLocaleString("he-IL")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("w-full rounded-t-2xl bg-gradient-accent", heights[position === 0 ? 1 : position === 1 ? 0 : 2]) })
				]
			}, player.id);
		})
	});
}
//#endregion
export { LeaderboardList as a, Countdown as i, AnswerTile as n, Podium as o, ConnectionBadge as r, cn as s, AnswerShape as t };
