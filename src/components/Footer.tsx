export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
        <p className="text-center text-sm text-muted-foreground">
          © {year}{" "}
          <a
            href="https://tobe.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            ToBe
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}