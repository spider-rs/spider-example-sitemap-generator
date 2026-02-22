"use client";

import { useState } from "react";
import SearchBar from "./searchbar";
import { Button } from "@/components/ui/button";

interface TreeNode {
  name: string;
  fullPath: string;
  children: TreeNode[];
  isPage: boolean;
}

function buildTree(urls: string[]): TreeNode {
  const root: TreeNode = { name: "/", fullPath: "/", children: [], isPage: false };
  for (const url of urls) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        let child = current.children.find((c) => c.name === parts[i]);
        if (!child) {
          child = { name: parts[i], fullPath: "/" + parts.slice(0, i + 1).join("/"), children: [], isPage: false };
          current.children.push(child);
        }
        current = child;
      }
      current.isPage = true;
    } catch {}
  }
  return root;
}

function generateXML(urls: string[]): string {
  const entries = urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function TreeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  return (
    <div>
      <button className="flex items-center gap-1 py-1 hover:bg-muted/50 w-full text-left text-sm" style={{ paddingLeft: depth * 16 + 8 }} onClick={() => setOpen(!open)}>
        {node.children.length > 0 && <span className="text-xs">{open ? "▼" : "▶"}</span>}
        <span className={node.isPage ? "text-primary" : "text-muted-foreground"}>{node.name}</span>
        {node.children.length > 0 && <span className="text-xs text-muted-foreground ml-1">({node.children.length})</span>}
      </button>
      {open && node.children.map((child) => <TreeView key={child.fullPath} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function Generator() {
  const [data, setData] = useState<any[] | null>(null);

  const urls = [...new Set((data || []).filter((p) => p?.url).map((p: any) => p.url))];
  const tree = urls.length > 0 ? buildTree(urls) : null;
  const maxDepth = urls.reduce((max, url) => { try { return Math.max(max, new URL(url).pathname.split("/").filter(Boolean).length); } catch { return max; } }, 0);

  const downloadXML = () => {
    const xml = generateXML(urls);
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sitemap.xml"; a.click();
  };
  const downloadTXT = () => {
    const blob = new Blob([urls.join("\n")], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "urls.txt"; a.click();
  };
  const copyXML = () => navigator.clipboard.writeText(generateXML(urls));

  return (
    <div className="flex flex-col h-screen">
      <SearchBar setDataValues={setData} />
      <div className="flex-1 overflow-auto p-4">
        {tree && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-6">
                <div><span className="text-2xl font-bold">{urls.length}</span><span className="text-sm text-muted-foreground ml-1">Pages</span></div>
                <div><span className="text-2xl font-bold">{maxDepth}</span><span className="text-sm text-muted-foreground ml-1">Max Depth</span></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={downloadXML}>Download XML</Button>
                <Button size="sm" variant="outline" onClick={downloadTXT}>Download TXT</Button>
                <Button size="sm" variant="ghost" onClick={copyXML}>Copy XML</Button>
              </div>
            </div>
            <div className="border rounded-lg p-2 overflow-auto max-h-[calc(100vh-200px)]">
              <TreeView node={tree} />
            </div>
          </>
        )}
        {!data && <div className="flex items-center justify-center h-full text-muted-foreground">Enter a URL to generate sitemap</div>}
      </div>
    </div>
  );
}
