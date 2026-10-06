"use client";
import { useEffect, useRef } from "react";
import { createLeftPanel } from "../lib/left-panel";
export default function LeftPanel({ onSearch, onStatus }) {
  const rootRef = useRef(null),
    controller = useRef(null);
  useEffect(() => {
    const instance = createLeftPanel(rootRef.current, { onSearch, onStatus });
    controller.current = instance;
    return () => {
      instance.destroy();
      controller.current = null;
    };
  }, [onSearch, onStatus]);
  return (
    <section
      ref={rootRef}
      className="capture-panel flex min-w-0 flex-col p-[22px] bg-[#fafaf8] bg-[linear-gradient(#eeefed_1px,transparent_1px),linear-gradient(90deg,#eeefed_1px,transparent_1px)] bg-size-[24px_24px] max-lg:p-[18px] lg:[@media(max-height:760px)]:p-4"
    >
      <form
        id="search-form"
        onSubmit={(event) => controller.current?.submit(event)}
      >
        <div id="image-input">
          <div>
            <h3 className="panel-title font-pixel text-[23px] font-medium mb-2">
              Choose an animal
            </h3>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Demo photos use cached descriptions. User-uploaded photos will
              follow the description &gt; embedding pipeline.
            </p>
            <div className="demo-grid grid grid-cols-3 gap-[9px] mt-[18px] max-lg:gap-3 lg:[@media(max-height:760px)]:mt-3">
              <button
                onClick={(event) =>
                  controller.current?.selectDemo(event.currentTarget)
                }
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 demo-image aspect-[3/2] overflow-hidden p-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold hover:bg-[#eef3f8] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] group bg-white max-lg:max-h-[140px] rounded-none aria-pressed:shadow-[0_4px_0_#9f1838]"
                type="button"
                data-image="/demo-images/scarlet-tanager.jpg"
                data-name="Scarlet tanager"
                aria-pressed="false"
                aria-label="Select Scarlet tanager photo"
              >
                <img
                  className="block h-full w-full object-cover transition-transform duration-300 ease-out-back motion-reduce:transition-none motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 rounded-none"
                  src="/demo-images/scarlet-tanager.jpg"
                  alt="Scarlet tanager"
                  width="240"
                  height="160"
                  loading="lazy"
                />
              </button>
              <button
                onClick={(event) =>
                  controller.current?.selectDemo(event.currentTarget)
                }
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 demo-image aspect-[3/2] overflow-hidden p-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold hover:bg-[#eef3f8] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] group bg-white max-lg:max-h-[140px] rounded-none aria-pressed:shadow-[0_4px_0_#9f1838]"
                type="button"
                data-image="/demo-images/american-paddlefish.jpg"
                data-name="Paddlefish"
                aria-pressed="false"
                aria-label="Select Paddlefish photo"
              >
                <img
                  className="block h-full w-full object-cover transition-transform duration-300 ease-out-back motion-reduce:transition-none motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 rounded-none"
                  src="/demo-images/american-paddlefish.jpg"
                  alt="Paddlefish"
                  width="240"
                  height="160"
                  loading="lazy"
                />
              </button>
              <button
                onClick={(event) =>
                  controller.current?.selectDemo(event.currentTarget)
                }
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 demo-image aspect-[3/2] overflow-hidden p-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold hover:bg-[#eef3f8] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] group bg-white max-lg:max-h-[140px] rounded-none aria-pressed:shadow-[0_4px_0_#9f1838]"
                type="button"
                data-image="/demo-images/british-shorthair.jpg"
                data-name="British shorthair"
                aria-pressed="false"
                aria-label="Select British shorthair photo"
              >
                <img
                  className="block h-full w-full object-cover transition-transform duration-300 ease-out-back motion-reduce:transition-none motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 rounded-none"
                  src="/demo-images/british-shorthair.jpg"
                  alt="British shorthair"
                  width="240"
                  height="160"
                  loading="lazy"
                />
              </button>
              <button
                onClick={(event) =>
                  controller.current?.selectDemo(event.currentTarget)
                }
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 demo-image aspect-[3/2] overflow-hidden p-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold hover:bg-[#eef3f8] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] group bg-white max-lg:max-h-[140px] rounded-none aria-pressed:shadow-[0_4px_0_#9f1838]"
                type="button"
                data-image="/demo-images/adelie-penguin.jpg"
                data-name="Penguin"
                aria-pressed="false"
                aria-label="Select Penguin photo"
              >
                <img
                  className="block h-full w-full object-cover transition-transform duration-300 ease-out-back motion-reduce:transition-none motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 rounded-none"
                  src="/demo-images/adelie-penguin.jpg"
                  alt="Penguin"
                  width="240"
                  height="160"
                  loading="lazy"
                />
              </button>
              <button
                onClick={(event) =>
                  controller.current?.selectDemo(event.currentTarget)
                }
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 demo-image aspect-[3/2] overflow-hidden p-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold hover:bg-[#eef3f8] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] group bg-white max-lg:max-h-[140px] rounded-none aria-pressed:shadow-[0_4px_0_#9f1838]"
                type="button"
                data-image="/demo-images/amano-shrimp.jpg"
                data-name="Amano shrimp"
                aria-pressed="false"
                aria-label="Select Amano shrimp photo"
              >
                <img
                  className="block h-full w-full object-cover transition-transform duration-300 ease-out-back motion-reduce:transition-none motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 rounded-none"
                  src="/demo-images/amano-shrimp.jpg"
                  alt="Amano shrimp"
                  width="240"
                  height="160"
                  loading="lazy"
                />
              </button>
              <button
                onClick={(event) =>
                  controller.current?.selectDemo(event.currentTarget)
                }
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 demo-image aspect-[3/2] overflow-hidden p-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold hover:bg-[#eef3f8] origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] group bg-white max-lg:max-h-[140px] rounded-none aria-pressed:shadow-[0_4px_0_#9f1838]"
                type="button"
                data-image="/demo-images/american-shorthair.jpg"
                data-name="American shorthair"
                aria-pressed="false"
                aria-label="Select American shorthair photo"
              >
                <img
                  className="block h-full w-full object-cover transition-transform duration-300 ease-out-back motion-reduce:transition-none motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 rounded-none"
                  src="/demo-images/american-shorthair.jpg"
                  alt="American shorthair"
                  width="240"
                  height="160"
                  loading="lazy"
                />
              </button>
            </div>
            <details className="mt-2 text-[10px] leading-relaxed text-neutral-500 [&_summary]:cursor-pointer [&_ul]:list-disc [&_ul]:pl-4 [&_li]:my-2.5 [&_a]:underline">
              <summary className="focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none origin-left motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:[transform:translateX(4px)_scale(1.05,0.95)] motion-safe:active:[transform:translateX(4px)_scale(1.1,0.9)]">
                Photo credits &amp; licenses
              </summary>
              <ul>
                <li>
                  <strong>Scarlet Tanager</strong>: By Rhododendrites — Own
                  work.
                  <a
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="CC BY-SA 4.0"
                  >
                    CC BY-SA 4.0
                  </a>
                  .
                  <a
                    href="https://commons.wikimedia.org/w/index.php?curid=117747528"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="Wikimedia Commons"
                  >
                    Wikimedia Commons
                  </a>
                  .
                </li>
                <li>
                  <strong>American Paddlefish</strong>: By U.S. Fish and
                  Wildlife Service —
                  <a
                    href="https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=876"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="Source"
                  >
                    Source
                  </a>
                  . Public Domain.
                  <a
                    href="https://commons.wikimedia.org/w/index.php?curid=122108428"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="Wikimedia Commons"
                  >
                    Wikimedia Commons
                  </a>
                  .
                </li>
                <li>
                  <strong>British Shorthair</strong>: By BritishEmpire — Own
                  work.
                  <a
                    href="https://creativecommons.org/licenses/by-sa/3.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="CC BY-SA 3.0"
                  >
                    CC BY-SA 3.0
                  </a>
                  .
                  <a
                    href="https://commons.wikimedia.org/w/index.php?curid=6425038"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="Wikimedia Commons"
                  >
                    Wikimedia Commons
                  </a>
                  .
                </li>
                <li>
                  <strong>Adelie Penguin</strong>: By Andrew Shiva / Wikipedia.
                  <a
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="CC BY-SA 4.0"
                  >
                    CC BY-SA 4.0
                  </a>
                  .
                  <a
                    href="https://commons.wikimedia.org/w/index.php?curid=46714803"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="Wikimedia Commons"
                  >
                    Wikimedia Commons
                  </a>
                  .
                </li>
                <li>
                  <strong>Amano Shrimp</strong>: By Stefanie Leuker — Imported
                  from 500px (archived version) by the Archive Team (detail
                  page).
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="CC0"
                  >
                    CC0
                  </a>
                  .
                  <a
                    href="https://commons.wikimedia.org/w/index.php?curid=72823464"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="Wikimedia Commons"
                  >
                    Wikimedia Commons
                  </a>
                  .
                </li>
                <li>
                  <strong>American Shorthair</strong>: By odin_aka_zero-one —
                  Own work.
                  <a
                    href="https://creativecommons.org/licenses/by-sa/3.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="CC BY-SA 3.0"
                  >
                    CC BY-SA 3.0
                  </a>
                  .
                  <a
                    href="https://commons.wikimedia.org/w/index.php?curid=12868665"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="color-wipe-link"
                    data-hover-label="Wikimedia Commons"
                  >
                    Wikimedia Commons
                  </a>
                  .
                </li>
              </ul>
              <p className="leading-relaxed">
                Display and search copies are resized and JPEG-compressed.
                Original files are unchanged.
              </p>
            </details>
          </div>
          <img
            id="preview"
            onLoad={() => controller.current?.showPreview()}
            className="mx-auto h-auto max-h-52 max-w-full object-contain mt-[18px] lg:max-h-[17dvh] rounded-none"
            alt="Selected animal photo"
            hidden
          />
          <details className="mt-3.5" id="upload-option">
            <summary className="cursor-pointer py-1 text-xs text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none origin-left motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:[transform:translateX(4px)_scale(1.05,0.95)] motion-safe:active:[transform:translateX(4px)_scale(1.1,0.9)]">
              Or upload your own photo
            </summary>
            <div className="mt-2">
              <label
                htmlFor="image"
                className="mb-2.5 block text-xs font-semibold"
              >
                Choose an animal photo
              </label>
              <input
                id="image"
                onChange={() => controller.current?.upload()}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="my-2 text-left file:mr-2 file:bg-neutral-100 file:px-2 file:py-1 w-full bg-white p-3 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none text-xs leading-normal rounded-none border-0"
              />
              <p className="text-xs text-neutral-500 leading-relaxed">
                JPEG, PNG, or WebP · up to 10 MB
              </p>
            </div>
          </details>
          <details id="text-option" className="mt-[5px]">
            <summary className="cursor-pointer py-1 text-xs text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none origin-left motion-safe:[@media(hover:hover)_and_(pointer:fine)]:hover:[transform:translateX(4px)_scale(1.05,0.95)] motion-safe:active:[transform:translateX(4px)_scale(1.1,0.9)]">
              Or describe an animal
            </summary>
            <div id="text-input" className="mt-2">
              <label
                htmlFor="description"
                className="mb-2.5 block text-xs font-semibold"
              >
                Describe an animal
              </label>
              <textarea
                id="description"
                maxLength="4000"
                rows="5"
                placeholder="describe an animal and it's features, be descriptive! for best results, identify details of it's features like fur, skin, limbs, etc."
                className="min-h-[120px] resize-y w-full bg-white p-3 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none text-xs leading-relaxed rounded-none border-0"
              ></textarea>
              <button
                className="cursor-pointer disabled:cursor-wait disabled:opacity-50 px-0 py-2 text-[11px] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none font-semibold origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] bg-transparent shadow-none text-[#28659a] hover:bg-transparent rounded-none"
                type="button"
                id="example"
                onClick={() => controller.current?.example()}
              >
                Try an example ↗
              </button>
            </div>
          </details>
        </div>
        <button
          className="button-color-sweep cursor-pointer disabled:cursor-wait disabled:opacity-50 flex w-full justify-between focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none origin-center motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:scale(1.05,0.95)] motion-safe:enabled:active:[transform:scale(1.1,0.9)] bg-dex-red text-white shadow-[0_3px_0_#6d1730] mt-5 py-3 px-[15px] font-pixel text-lg font-medium leading-normal rounded-none"
          id="search-button"
          type="submit"
        >
          <span id="search-button-label">Identify Animal</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <p className="mt-auto pt-6 text-[10px] leading-relaxed text-neutral-500">
        To show off how FaunaDex can continue to grow without training cost, any
        user can add embeddings to the ever-growing database. Please be
        respectful and only add real animals, and report any vandalism of the
        database to{" "}
        <a
          href="mailto:andrewdai.dev@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="color-wipe-link"
          data-hover-label="andrewdai.dev@gmail.com"
        >
          andrewdai.dev@gmail.com
        </a>
      </p>
    </section>
  );
}
