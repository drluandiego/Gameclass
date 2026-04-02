import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Usar MJS via unpkg é padrão da V4+ para garantir que plugins estáticos funcionem isolados no front-end
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl, pageNumber, onDocumentLoadSuccess, width = 800 }) {
  if (!fileUrl) return <div style={{padding: '2rem', color: 'var(--text-muted)'}}>Iniciando renderizador seguro...</div>;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#000',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      border: '1px solid var(--glass-border)'
    }}>
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div style={{padding: '4rem', color: 'var(--primary)'}}>Construindo Imagem do Slide...</div>}
        error={<div style={{padding: '3rem', color: 'var(--danger)'}}>Ocorreu um erro ao decodificar este PDF.</div>}
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          width={width}
        />
      </Document>
    </div>
  );
}
