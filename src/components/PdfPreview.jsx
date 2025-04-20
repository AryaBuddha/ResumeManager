import React, { useEffect, useRef, useState } from "react";
import { pdfjs } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PdfPreview({ filePath }) {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);

  // Load document
  useEffect(() => {
    if (!filePath) return;
    const loadingTask = pdfjs.getDocument(filePath);
    loadingTask.promise.then((pdf) => {
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNumber(1);
    });
  }, [filePath]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc) return;
    pdfDoc.getPage(pageNumber).then((page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: context, viewport });
    });
  }, [pdfDoc, pageNumber]);

  const changePage = (offset) => {
    setPageNumber((prev) => Math.min(Math.max(prev + offset, 1), numPages));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div>
        <button onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
          &lt; Prev
        </button>
        <span style={{ margin: "0 8px" }}>
          Page {pageNumber} of {numPages}
        </span>
        <button onClick={() => changePage(1)} disabled={pageNumber >= numPages}>
          Next &gt;
        </button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", marginTop: 8 }}
      />
    </div>
  );
}
