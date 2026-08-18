import { useEffect, useRef, useState } from "react";

/* =========================================================================
   PptViewer — renders a .pptx inline, in the browser (client-side).

   Uses the `pptx-preview` package (+ `jszip`). Rendering happens entirely
   in the browser, so it works BOTH on localhost and on the deployed host.

   Required packages (install once in Frontend/):
     npm install pptx-preview jszip --legacy-peer-deps

   All slides are rendered stacked and centered on a full-width canvas; the
   frame scrolls vertically. The slide itself is kept compact.
========================================================================= */

// Some decks ship an empty <p:defaultTextStyle/>, which makes pptx-preview
// render blank slides. Patch it to a usable default before previewing.
async function normalizePptx(JSZip, arrayBuffer) {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const presentation = zip.file("ppt/presentation.xml");
    if (!presentation) throw new Error("Missing presentation.xml");

    const xml = await presentation.async("string");
    const defaultTextStyle =
        "<p:defaultTextStyle><a:defPPr/><a:lvl1pPr/><a:lvl2pPr/>" +
        "<a:lvl3pPr/><a:lvl4pPr/><a:lvl5pPr/><a:lvl6pPr/><a:lvl7pPr/>" +
        "<a:lvl8pPr/><a:lvl9pPr/></p:defaultTextStyle>";
    const hasUsableDefaultTextStyle = /<p:defaultTextStyle>\s*<a:[^>]+/.test(xml);

    if (!hasUsableDefaultTextStyle) {
        const normalized = xml
            .replace(
                /<p:defaultTextStyle\s*\/>|<p:defaultTextStyle>[\s\S]*?<\/p:defaultTextStyle>/,
                defaultTextStyle,
            )
            .replace("</p:presentation>", `${defaultTextStyle}</p:presentation>`);
        zip.file("ppt/presentation.xml", normalized);
    }

    return zip.generateAsync({ type: "arraybuffer" });
}

// Keep the slide compact regardless of how wide the card is.
const SLIDE_MAX_WIDTH = 620;

export default function PptViewer({ fileUrl, height = 420, onStatusChange }) {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const previewerRef = useRef(null);

    const [status, setStatus] = useState("loading"); // loading | ready | error

    const onStatusRef = useRef(onStatusChange);
    onStatusRef.current = onStatusChange;

    useEffect(() => {
        let cancelled = false;

        if (!fileUrl) return undefined;

        const update = (next) => {
            if (cancelled) return;
            setStatus(next);
            onStatusRef.current?.(next);
        };

        update("loading");

        (async () => {
            // Dynamic imports so a missing install surfaces as the clean
            // fallback instead of a hard build/runtime crash.
            const [{ init }, JSZipModule, response] = await Promise.all([
                import("pptx-preview"),
                import("jszip"),
                fetch(fileUrl),
            ]);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const JSZip = JSZipModule.default || JSZipModule;
            const buffer = await response.arrayBuffer();
            const normalized = await normalizePptx(JSZip, buffer);

            if (cancelled || !containerRef.current || !wrapperRef.current) return;

            if (previewerRef.current) previewerRef.current.destroy();
            containerRef.current.innerHTML = "";

            // Compact, centered slide on a full-width canvas.
            const availWidth = wrapperRef.current.clientWidth || 720;
            const width = Math.max(
                240,
                Math.min(availWidth - 48, SLIDE_MAX_WIDTH),
            );
            containerRef.current.style.width = `${width}px`;

            const previewer = init(containerRef.current, {
                width,
                height: Math.round((width * 9) / 16),
                mode: "list",
            });
            previewerRef.current = previewer;

            await previewer.preview(normalized);

            update("ready");
        })().catch((err) => {
            // eslint-disable-next-line no-console
            console.error("PPT inline render failed:", err);
            update("error");
        });

        return () => {
            cancelled = true;
            if (previewerRef.current) {
                previewerRef.current.destroy();
                previewerRef.current = null;
            }
        };
    }, [fileUrl]);

    if (!fileUrl) {
        return (
            <span className="text-[13px] text-[#3f9d90]">
                No file available.
            </span>
        );
    }

    return (
        <div ref={wrapperRef} className="w-full">
            <div
                className="relative flex flex-col items-center gap-[16px] overflow-y-auto rounded-[8px] border border-[#D8E2EF] bg-[#f0f0f0] p-6"
                style={{ minHeight: height, maxHeight: 560 }}
            >
                <div
                    ref={containerRef}
                    className="mx-auto [&>*]:!mx-auto [&>*]:!mb-[16px] [&>*]:overflow-hidden [&>*]:rounded-[6px] [&>*]:border [&>*]:border-[#d4c2d1] [&>*]:bg-white [&>*]:shadow-[0_6px_20px_rgba(0,0,0,0.16)]"
                />

                {status !== "ready" && (
                    <div className="absolute inset-0 flex items-center justify-center text-[12px]">
                        {status === "loading" ? (
                            <span className="text-[#5e6e82]">
                                Loading PPT preview…
                            </span>
                        ) : (
                            <span className="px-4 text-center text-[#D74D43]">
                                Couldn’t render this PPT inline. Use the download
                                link below to view the file.
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
