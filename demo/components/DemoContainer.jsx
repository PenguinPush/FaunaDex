"use client";
import { useCallback, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import LeftPanel from "./LeftPanel";
import GraphPanel from "./GraphPanel";
export default function DemoContainer() {
  const graphRef = useRef(null);
  const onSearch = useCallback(
    (body, mode) => graphRef.current?.search(body, mode),
    [],
  );
  const onStatus = useCallback(
    (text, error = false) => graphRef.current?.status(text, error),
    [],
  );
  return (
    <main className="demo-shell mx-auto max-w-[1600px] lg:flex lg:flex-col px-[clamp(16px,2.5vw,40px)] py-[clamp(16px,2.5vh,28px)] sm:px-[clamp(16px,2.5vw,40px)] lg:h-dvh lg:min-h-0 lg:[@media(max-height:760px)]:py-3.5">
      <Header />
      <div className="mb-[5px] workspace grid overflow-hidden lg:min-h-min lg:flex-1 bg-white shadow-[0_5px_0_#d5dbdd] lg:grid-cols-[clamp(280px,24vw,350px)_minmax(0,1fr)] motion-safe:animate-bounce-in-left rounded-none border-t-4 border-t-dex-red">
        <LeftPanel onSearch={onSearch} onStatus={onStatus} />
        <GraphPanel ref={graphRef} />
      </div>
      <Footer />
    </main>
  );
}
