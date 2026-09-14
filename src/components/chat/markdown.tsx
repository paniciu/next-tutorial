"use client";

import { Copy } from "lucide-react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkReact from "remark-react";
import { toast } from "sonner";
import hljs from "highlight.js";
import { Fragment, createElement } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type MarkdownProps = {
  content: string;
};

type ComponentProps = {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
};

// De ce: lista de limbaje suportate pentru highlighting. Se importă doar acestea din
// highlight.js pentru a limita bundle size (sute de kilobytes dacă se importa tot biblioteca).
const SUPPORTED_LANGUAGES = ["ts", "tsx", "js", "json", "bash", "sh", "sql", "python"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markdown: any = unified()
  .use(remarkParse)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .use(remarkReact as any, {
    createElement,
    Fragment,
    components: {
      code: CodeBlock,
      a: SafeLink,
      h1: (props: ComponentProps) => <h1 className="text-2xl font-bold" {...props} />,
      h2: (props: ComponentProps) => <h2 className="text-xl font-bold" {...props} />,
      h3: (props: ComponentProps) => <h3 className="text-lg font-bold" {...props} />,
      h4: (props: ComponentProps) => <h4 className="font-bold" {...props} />,
      h5: (props: ComponentProps) => <h5 className="font-semibold" {...props} />,
      h6: (props: ComponentProps) => <h6 className="font-semibold" {...props} />,
      ol: (props: ComponentProps) => <ol className="list-decimal pl-5" {...props} />,
      ul: (props: ComponentProps) => <ul className="list-disc pl-5" {...props} />,
      li: (props: ComponentProps) => <li className="mb-1" {...props} />,
      blockquote: (props: ComponentProps) => (
        <blockquote className="border-l-4 border-muted-foreground/30 pl-4 text-muted-foreground italic" {...props} />
      ),
      table: (props: ComponentProps) => (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-muted" {...props} />
        </div>
      ),
      th: (props: ComponentProps) => <th className="border border-muted bg-muted px-3 py-2" {...props} />,
      td: (props: ComponentProps) => <td className="border border-muted px-3 py-2" {...props} />,
      p: (props: ComponentProps) => <p className="mb-3" {...props} />
    }
  });

function SafeLink({ href, children }: { href?: string; children?: ReactNode }) {
  if (!href) {
    return <span>{children}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
      {children}
    </a>
  );
}

type CodeBlockProps = {
  children?: string;
  className?: string;
  inline?: boolean;
};

function CodeBlock({ children, className, inline }: CodeBlockProps) {
  // De ce: detect clipboard availability la render time, nu în effect.
  const canCopy =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard?.writeText);

  if (inline) {
    return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>;
  }

  const languageMatch = className?.match(/language-(\w+)/);
  const language = languageMatch?.[1] || "";
  const shouldHighlight = SUPPORTED_LANGUAGES.includes(language);

  let highlightedHtml: string | null = null;
  if (shouldHighlight && children) {
    try {
      highlightedHtml = hljs.highlight(children, { language, ignoreIllegals: true }).value;
    } catch {
      highlightedHtml = null;
    }
  }

  const handleCopy = async () => {
    if (!children) return;

    try {
      await navigator.clipboard.writeText(children);
      toast.success("Cod copiat.");
    } catch {
      toast.error("Nu s-a putut copia.");
    }
  };

  return (
    <article className="group relative mb-3 overflow-hidden rounded-lg border border-muted bg-muted/30">
      <div className="flex items-center justify-between border-b border-muted px-4 py-2">
        <code className="text-xs font-medium text-muted-foreground">{language || "plaintext"}</code>

        {canCopy ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleCopy}
                className="text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <Copy className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copiază cod</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon-xs" disabled className="cursor-not-allowed opacity-60">
                <Copy className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clipboard indisponibil</TooltipContent>
          </Tooltip>
        )}
      </div>

      {highlightedHtml ? (
        <pre className="overflow-x-auto px-4 py-3">
          <code
            className={cn("font-mono text-sm leading-relaxed", shouldHighlight && "hljs")}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      ) : (
        <pre className="overflow-x-auto px-4 py-3">
          <code className="font-mono text-sm leading-relaxed">{children}</code>
        </pre>
      )}
    </article>
  );
}

export function MarkdownRenderer({ content }: MarkdownProps) {
  if (!content || content.trim().length === 0) {
    return null;
  }

  let renderedContent: ReactNode = null;
  try {
    const nodes = markdown.processSync(content);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderedContent = (nodes.result as any) || null;
  } catch (error) {
    console.error("Markdown parsing error:", error);
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }

  return <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">{renderedContent}</div>;
}
