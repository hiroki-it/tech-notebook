let mermaidInitialized = false;

document$.subscribe(async () => {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "dark",
    });
    mermaidInitialized = true;
  }

  await mermaid.run({querySelector: ".mermaid"});
});
