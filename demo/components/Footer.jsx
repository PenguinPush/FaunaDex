export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-neutral-500 shrink-0 mt-[18px] text-[11px] lg:[@media(max-height:760px)]:mt-3 leading-[1.333333]">
      <span>
        Made by{" "}
        <a
          href="https://andrewd.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="color-wipe-link"
          data-hover-label="Andrew Dai"
        >
          Andrew Dai
        </a>
      </span>
      <a
        href="https://github.com/PenguinPush/faunadex"
        target="_blank"
        rel="noopener noreferrer"
        className="color-wipe-link"
        data-hover-label="Github Repository"
      >
        Github Repository
      </a>
      <a
        href="mailto:andrewdai.dev@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        className="color-wipe-link"
        data-hover-label="Report Vandalism"
      >
        Report Vandalism
      </a>
      <a
        href="https://huggingface.co/PenguinPush/datasets"
        target="_blank"
        rel="noopener noreferrer"
        className="color-wipe-link"
        data-hover-label="View Datasets"
      >
        View Datasets
      </a>
    </footer>
  );
}
