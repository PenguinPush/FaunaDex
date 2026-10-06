export default function Header() {
  return (
    <header className="shrink-0 flex items-center justify-center gap-8 mb-[22px] motion-safe:animate-bounce-in-right max-lg:items-start max-lg:gap-3.5 max-lg:flex-col max-lg:mb-5 lg:[@media(max-height:760px)]:mb-3.5">
      <div className="brand flex items-center gap-4">
        <img
          className="dex-mark block shrink-0 size-[42px] object-contain [image-rendering:pixelated] rounded-none"
          src="/static/dex-mark.png"
          width="42"
          height="42"
          alt=""
        />
        <div>
          <h1 className="font-pixel text-[40px] leading-none font-semibold tracking-[-1.5px] lg:[@media(max-height:760px)]:text-[34px]">
            FaunaDex
          </h1>
        </div>
      </div>
      <p className="intro bg-[#edf0ef] max-w-[480px] text-xs text-neutral-500 max-lg:max-w-[580px] leading-relaxed md:text-right">
        FaunaDex performs semantic species retrieval on animal photos by
        matching visual descriptions with a vector search. Instead of lengthy
        training on individual photos of each species, the database can be
        expanded simply by adding more embeddings. Give it a try!
      </p>
    </header>
  );
}
