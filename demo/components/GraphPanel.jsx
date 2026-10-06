"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createGraphPanel } from "../lib/graph-panel";
const GraphPanel = forwardRef(function GraphPanel(_, ref) {
  const rootRef = useRef(null),
    controller = useRef(null);
  useEffect(() => {
    const instance = createGraphPanel(rootRef.current);
    controller.current = instance;
    return () => {
      instance.destroy();
      controller.current = null;
    };
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      search: (...args) => controller.current?.search(...args),
      status: (...args) => controller.current?.status(...args),
    }),
    [],
  );
  return (
    <section
      ref={rootRef}
      className="explore-panel lg:[contain:size] min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto p-5 max-lg:p-[18px] lg:[@media(max-height:760px)]:p-4"
      aria-label="Semantic search results"
    >
      <div
        id="results"
        className="shrink-0 lg:grid lg:grid-cols-[minmax(120px,1fr)_minmax(0,2fr)] gap-5 lg:gap-x-5 mb-[18px] lg:[@media(max-height:760px)]:mb-3"
        hidden
      >
        <div>
          <p className="text-[10px] font-bold tracking-[1.7px] text-neutral-500 leading-relaxed">
            CLOSEST MATCH
          </p>
          <h3
            id="best-match"
            className="mt-1 font-medium tracking-tight font-pixel text-dex-red text-[28px] leading-[1.1]"
          ></h3>
        </div>

        <div className="mt-2 wrap-anywhere lg:mt-0 bg-[#eff5fa] py-3 px-3.5">
          <p
            id="query-label"
            className="text-[10px] font-bold tracking-[1.7px] text-neutral-500 leading-relaxed"
          >
            VISIBLE FEATURES
          </p>
          <p
            id="query-text"
            className="mt-1 text-xs lg:max-h-16 lg:overflow-y-auto leading-relaxed"
          ></p>
        </div>
      </div>
      <section
        className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
        aria-label="Interactive embedding neighborhood"
      >
        <div className="add-panel shrink-0 p-2 bg-[#fafaf8] bg-[linear-gradient(#eeefed_1px,transparent_1px),linear-gradient(90deg,#eeefed_1px,transparent_1px)] bg-size-[24px_24px] py-3 px-3.5 mb-3.5 lg:[@media(max-height:760px)]:py-2 lg:[@media(max-height:760px)]:px-2.5 lg:[@media(max-height:760px)]:mb-2.5 rounded-none">
          <form
            id="add-form"
            onSubmit={(event) => controller.current?.addAnimal(event)}
            className="sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-x-3"
          >
            <label
              htmlFor="animal-name"
              className="block font-semibold mb-1 text-xs sm:mb-0"
            >
              Add new animal embeddings to the database:
            </label>
            <div className="flex gap-2 [&_input]:min-w-0 [&_button]:whitespace-nowrap">
              <input
                id="animal-name"
                placeholder="e.g. White-Tailed Deer"
                maxLength="200"
                required
                className="w-full bg-white p-3 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none text-xs leading-normal rounded-none border-0"
              />
              <button
                type="submit"
                id="add-button"
                className="cursor-pointer px-4 py-2.5 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold shadow-[0_2px_0_#dce1e3] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] text-[#245e8b] bg-[#eff5fa] hover:bg-[#eff5fa] rounded-none"
              >
                Add +
              </button>
            </div>
            <p
              id="add-status"
              className="m-0 text-xs break-words [&:not(:empty)]:mt-2 [&.error]:text-red-800 sm:col-span-2 leading-[18px]"
              role="status"
              aria-live="polite"
            ></p>
          </form>
        </div>

        <p
          id="search-status"
          className="m-0 shrink-0 text-xs [&:not(:empty)]:mb-2 [&.error]:text-red-800 leading-relaxed"
          role="status"
          aria-live="polite"
        ></p>
        <div className="map-layout grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:grid-cols-[minmax(0,1fr)_220px] lg:flex-1 gap-[18px] sm:gap-[18px] max-lg:gap-3 lg:grid-cols-[minmax(0,1fr)_clamp(200px,20vw,270px)] xl:grid-cols-[minmax(0,1fr)_clamp(200px,20vw,270px)] lg:min-h-[220px]">
          <div className="map-panel relative overflow-hidden min-w-0 bg-[#fafaf8] bg-[linear-gradient(#eeefed_1px,transparent_1px),linear-gradient(90deg,#eeefed_1px,transparent_1px)] bg-size-[24px_24px] rounded-none">
            <div
              id="neighbor-graph"
              className="relative h-[360px] w-full touch-none sm:h-[420px] lg:h-full scroll-mt-3 lg:min-h-[220px]"
              role="img"
              aria-label="Interactive graph of all animals. Use the animal lookup for keyboard navigation."
            ></div>
            <p
              id="graph-caption"
              className="pointer-events-none absolute bottom-3 left-3 right-3 m-0 text-neutral-500 font-pixel text-sm leading-relaxed max-lg:bottom-2 max-lg:left-2 max-lg:right-2"
            ></p>
            <div className="absolute flex flex-wrap justify-end top-3 left-3 right-3 gap-[5px] max-lg:top-2 max-lg:left-2 max-lg:right-2">
              <button
                id="graph-layout"
                type="button"
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 mr-auto px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold shadow-[0_2px_0_#dce1e3] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] text-[10px] bg-white/95 hover:bg-white/95 leading-[1.333333] rounded-none"
                disabled
              >
                Show Search Distances
              </button>
              <button
                type="button"
                id="graph-zoom-out"
                aria-label="Zoom out"
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold shadow-[0_2px_0_#dce1e3] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] text-[10px] bg-white/95 hover:bg-white/95 leading-[1.333333] rounded-none"
              >
                −
              </button>
              <button
                type="button"
                id="graph-zoom-in"
                aria-label="Zoom in"
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold shadow-[0_2px_0_#dce1e3] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] text-[10px] bg-white/95 hover:bg-white/95 leading-[1.333333] rounded-none"
              >
                +
              </button>
              <button
                type="button"
                id="graph-reset"
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold shadow-[0_2px_0_#dce1e3] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] text-[10px] bg-white/95 hover:bg-white/95 leading-[1.333333] rounded-none"
              >
                Reset View
              </button>
            </div>
          </div>
          <aside
            className="finder-panel min-w-0 lg:flex lg:min-h-0 lg:flex-col pt-1 px-0 pb-0"
            aria-label="Find animals and compare distances"
          >
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <input
                  id="graph-find"
                  list="graph-names"
                  placeholder="Type an animal name..."
                  autoComplete="off"
                  className="w-full bg-white p-3 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none text-xs leading-normal rounded-none border-0"
                />
                <datalist id="graph-names"></datalist>
              </div>
              <button
                id="graph-find-button"
                type="button"
                className="cursor-pointer px-4 py-2.5 disabled:cursor-wait disabled:opacity-50 text-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold shadow-[0_2px_0_#dce1e3] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] text-[#245e8b] bg-[#eff5fa] hover:bg-[#eff5fa] rounded-none"
              >
                Find
              </button>
            </div>
            <div
              id="graph-selection"
              className="p-2 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col pt-4 px-0 pb-0 rounded-none"
              hidden
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  id="graph-node-name"
                  className="min-w-0 break-words font-pixel text-xl font-medium max-lg:text-[17px]"
                ></h3>
              </div>
              <p className="mt-3 text-[10px] tracking-wide text-neutral-500 leading-relaxed">
                Neighbours by Cosine Similarity
              </p>
              <div
                id="graph-neighbors"
                className="grid max-h-64 overflow-x-hidden overflow-y-auto [&_button]:min-w-0 lg:[&_button]:min-h-8 [&_button]:gap-1 [&_button]:px-1 [&_button>span:first-child]:min-w-0 [&_button>span:first-child]:break-words [&_button>span:last-child]:shrink-0 lg:min-h-0 lg:max-h-none lg:flex-1 content-start gap-[5px] mt-2 pt-0.5 pr-1 pb-1 pl-0"
              ></div>
            </div>
          </aside>
        </div>
      </section>
    </section>
  );
});
export default GraphPanel;
