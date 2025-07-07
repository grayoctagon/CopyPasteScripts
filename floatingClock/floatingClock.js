/*
	Author: Michael Beck
	Version: 2025-07-06
	License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
	License URL: https://creativecommons.org/licenses/by-sa/4.0/
	Repository: https://github.com/grayoctagon/CopyPasteScripts/#floatingclock

	You are free to:
	- Share: Copy and redistribute the material in any medium or format.
	- Adapt: Remix, transform, and build upon the material for any purpose, even commercially.

	Under the following terms:
	- Attribution: You must give appropriate credit, provide a link to the license, and indicate if changes were made.
	- ShareAlike: If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

	Disclaimer:
	This work is provided "as is" without any warranties or guarantees of any kind.

	Description: 
	floatingClock.js – fügt einer Website eine frei positionier‑ und skalierbare Digitaluhr (Dark‑Mode) hinzu.
	 ‑ 24‑h‑Format mit Sekunden
	 ‑ zweite Zeile: deutsches Datum + Wochentags‑Kürzel
	 ‑ Drag‑&‑Drop (Maus + Touch) zum Verschieben
	 ‑ Resize‑Handles + Zwei‑Finger‑Pinch zum Skalieren
	 Einbinden: <script src="floatingClock.js"></script>
 */

// Initialisierung nach DOM‑Load
document.addEventListener("DOMContentLoaded", function(){
	mkFloatingClock();
});

function mkFloatingClock() {
	// Einstellungen aus localStorage laden oder Defaults nehmen
	let savedSettings = {};
	try {
		savedSettings = JSON.parse(localStorage.getItem("floatingclockSettings")) || {};
	} catch (e) {}

	let startSize = [savedSettings.width || 200, savedSettings.height || 100];
	let startPos = [savedSettings.left || (window.innerWidth - startSize[0]), savedSettings.top || 0];

	// Hilfsfunktion zum Speichern
	function saveClockSettings() {
		const rect = clock.getBoundingClientRect();
		localStorage.setItem("floatingclockSettings", JSON.stringify({
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height
		}));
	}
	/** 1. CSS – nur einmal anhängen */
	if (!document.getElementById("floatingClockStyle")) {
		const css = `
			#floatingClock {
				box-sizing: border-box;
				position: fixed;
				left: ` + startPos[0] + `px;
				top: ` + startPos[1] + `px;
				min-width: 80px;
				min-height: 40px;
				width: `+startSize[0]+`px;
				height: `+startSize[1]+`px;
				background: rgba(42, 42, 42, 0.8);
				padding: 1px 2px;
				border-radius: 16px;
				box-shadow: 0 0 14px rgba(0, 255, 0, 0.9);
				user-select: none;
				touch-action: none; /* ermöglicht Pointer‑Gesten */
				overflow: hidden;
				z-index: 9999;
			}
			.floatingClockText {
				opacity: 0.8;
				fill: #0f0;
				font-family: 'Courier New', monospace;
				line-height: 1.25;
				font-size: 40px;
			}
			#floatingClock .date {
				font-size: 22px;
				opacity: 0.8;
			}
			#floatingClock .resize-handle {
				position: absolute;
				width: 18px;
				height: 18px;
				background: #222;
				border: 2px solid #0f0;
				border-radius: 50%;
			}
			#floatingClock .resize-handle.tl {top: -9px; left: -9px; cursor: nwse-resize;}
			#floatingClock .resize-handle.tr {top: -9px; right: -9px; cursor: nesw-resize;}
			#floatingClock .resize-handle.bl {bottom: -9px; left: -9px; cursor: nesw-resize;}
			#floatingClock .resize-handle.br {bottom: -9px; right: -9px; cursor: nwse-resize;}
		`;
		const styleTag = document.createElement("style");
		styleTag.id = "floatingClockStyle";
		styleTag.textContent = css.replace(/\s+/g, " ");
		document.head.appendChild(styleTag);
	}

	/** 2. DOM‑Element erzeugen (falls nicht bereits vorhanden) */
	if (document.getElementById("floatingClock")) return; // schon da

	const clock = document.createElement("div");
	window.clock=clock;
	clock.id = "floatingClock";
	clock.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" id="floatingClockSVG" viewBox="0 0 200 100" width="100%" height="100%">
				<text x="100" y="40" class="time floatingClockText" text-anchor='middle'>00:00:00</text>
				<text x="100" y="80" class="date floatingClockText" text-anchor='middle'>Mo 01.01.1970</text>
			</svg>
			<!--<span class="resize-handle tl"></span>
			<span class="resize-handle tr"></span>
			<span class="resize-handle bl"></span>-->
			<span class="resize-handle br"></span>`;
	clock.innerHTML +=" ";
	document.body.appendChild(clock);

	const resizeHandles = clock.querySelectorAll('.resize-handle');

	/** 3. Zeit & Datum aktualisieren + dynamische Farbmodi */
	const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
	function update() {
		const now = new Date();
		const timeStr = now.toLocaleTimeString("de-DE", {
			hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"
		});
		const dateStr = now.toLocaleDateString("de-DE", {
			day: "2-digit", month: "2-digit", year: "numeric"
		});

		clock.querySelector(".time").textContent = timeStr;
		clock.querySelector(".date").textContent = `${weekdays[now.getDay()]} ${dateStr}`;

		/* Farbschema je nach Tageszeit */
		const h = now.getHours();
		let col = "#0f0";						// Standard (10‑18 Uhr)
		if (h >= 22 || h < 7) col = "#00aaff";								// Nacht
		else if ((h >= 7 && h < 9) || (h >= 18 && h < 22)) col = "#ff8800"; // Morgen/Abend

		clock.style.color = col;
		clock.style.boxShadow = `0 0 14px ${col}40`;
		clock.querySelectorAll(".floatingClockText").forEach(h => (h.style.fill=col));
		resizeHandles.forEach(h => (h.style.borderColor = col));
	}
	update();
	setInterval(update, 1000);

	/** 4. Drag & Drop (PointerEvents) */
	let dragData = null;
	clock.addEventListener("pointerdown", (ev) => {
		if (ev.target.classList.contains("resize-handle")) return; // Resizing übernimmt eigener Handler
		dragData = {
			pointerId: ev.pointerId,
			offsetX: ev.clientX - clock.getBoundingClientRect().left,
			offsetY: ev.clientY - clock.getBoundingClientRect().top,
		};
		clock.setPointerCapture(ev.pointerId);
	});
	clock.addEventListener("pointermove", (ev) => {
		if (!dragData || dragData.pointerId !== ev.pointerId) return;
		clock.style.left = `${ev.clientX - dragData.offsetX}px`;
		clock.style.top = `${ev.clientY - dragData.offsetY}px`;
		saveClockSettings();
	});
	clock.addEventListener("pointerup", (ev) => {
		if (dragData && dragData.pointerId === ev.pointerId) dragData = null;
	});
	clock.addEventListener("pointercancel", () => (dragData = null));

	/** 5. Resize via Handles (Seitenverhältnis fix) */
	clock.querySelectorAll(".resize-handle").forEach((handle) => {
		handle.addEventListener("pointerdown", (ev) => {
			let isResizing = true;
			let startX = ev.clientX;
			let startY = ev.clientY;
			let startWidth = clock.offsetWidth;
			let startHeight = clock.offsetHeight;
			console.log(Math.round(startWidth),Math.round(startHeight));
			//console.log(Math.round(ev.clientX),Math.round(ev.clientY));
			
			ev.stopPropagation(); // Drag nicht auslösen
			function onMove(moveEv) {
				const dx = (moveEv.clientX - startX);
				//console.log(Math.round(moveEv.clientX),Math.round(moveEv.clientY));
				//const dy = (moveEv.clientY - startY);
				let newW=startWidth+dx;
				let newH=startHeight*(newW / startWidth);
				clock.style.width = `${newW}px`;
				clock.style.height = `${newH}px`;
				saveClockSettings();
			}
			function onUp() {
				document.removeEventListener("pointermove", onMove);
				document.removeEventListener("pointerup", onUp);
			}
			document.addEventListener("pointermove", onMove);
			document.addEventListener("pointerup", onUp, { once: true });
		});
	});

	/** 6. Zwei‑Finger‑Pinch‑Zoom (Touch, Seitenverhältnis fix) */
	const active = new Map();
	let pinchData = null;
	function midPoint(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
	function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

	clock.addEventListener("pointerdown", (ev) => {
		active.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
		if (active.size === 2) {
			const pts = [...active.values()];
			pinchData = {
				startDist: distance(pts[0], pts[1]),
				startW: clock.offsetWidth,
				startH: clock.offsetHeight,
			};
		}
	});

	clock.addEventListener("pointermove", (ev) => {
		if (!active.has(ev.pointerId)) return;
		active.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
		if (active.size === 2 && pinchData) {
			const pts = [...active.values()];
			const newDist = distance(pts[0], pts[1]);
			const scale = newDist / pinchData.startDist;
			const newW = Math.max(120, pinchData.startW * scale);
			const newH = Math.max(60, pinchData.startH * scale);
			clock.style.width = `${newW}px`;
			clock.style.height = `${newH}px`;
			/* Uhr mittig zwischen Fingern platzieren */
			const mid = midPoint(pts[0], pts[1]);
			clock.style.left = `${mid.x - newW / 2}px`;
			clock.style.top = `${mid.y - newH / 2}px`;
			saveClockSettings();
		}
	});
	function clearPointer(ev) {
		active.delete(ev.pointerId);
		if (active.size < 2) pinchData = null;
	}
	clock.addEventListener("pointerup", clearPointer);
	clock.addEventListener("pointercancel", clearPointer);
}
