interface Props {
  title: string;
  body: string;
  onRetry?: () => void | undefined;
}

export default function EmptyState({ title, body, onRetry }: Props) {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f2f2ee] text-lg">!</div>
      <h1 className="mt-4 text-lg font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#f7f7f5]"
          >
            Try again
          </button>
        ) : null}
        <a
          href="/"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
