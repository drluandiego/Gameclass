import { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { getPlugin, getAllPlugins } from '../games/registry';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const THUMB_WIDTH = 152;

export default function SlideTimeline({ pdfFile, numPages, games, selectedSlide, onSelectSlide, onNumPages }) {
  const [pagesLoaded, setPagesLoaded] = useState(false);
  const scrollRef = useRef(null);

  const handleDocLoad = useCallback(({ numPages: n }) => {
    setPagesLoaded(true);
    onNumPages?.(n);
  }, [onNumPages]);

  // Map slide_number → game for quick lookup
  const gamesBySlide = {};
  games.forEach(g => {
    if (!gamesBySlide[g.slide_number]) gamesBySlide[g.slide_number] = [];
    gamesBySlide[g.slide_number].push(g);
  });

  if (!pdfFile) {
    return (
      <div className="glass-panel flex-center" style={{ minHeight: '160px' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          PDF não encontrado no cache local. Volte e recarregue a aula.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1rem 0.5rem' }}>
      <Document
        file={pdfFile}
        onLoadSuccess={handleDocLoad}
        loading={
          <div style={{ padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Carregando slides...
          </div>
        }
        error={
          <div style={{ padding: '2rem 1rem', color: 'var(--accent-red-text)', fontSize: '0.85rem' }}>
            Erro ao carregar PDF.
          </div>
        }
      >
        {pagesLoaded && numPages > 0 && (
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              padding: '0.5rem 0.75rem 0.5rem',
              scrollSnapType: 'x proximity',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {Array.from({ length: numPages }, (_, i) => {
              const slideNum = i + 1;
              const isSelected = selectedSlide === slideNum;
              const slideGames = gamesBySlide[slideNum] || [];

              return (
                <div
                  key={slideNum}
                  onClick={() => onSelectSlide(slideNum)}
                  style={{
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    cursor: 'pointer',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {/* Thumbnail container */}
                  <div style={{
                    position: 'relative',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                    border: isSelected
                      ? '2px solid var(--text-primary)'
                      : '1px solid var(--border)',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(0,0,0,0.25)'
                      : '0 1px 4px rgba(0,0,0,0.1)',
                    background: '#000',
                  }}>
                    <Page
                      pageNumber={slideNum}
                      width={THUMB_WIDTH}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />

                    {/* Slide number badge */}
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      fontFamily: "'SF Mono', monospace",
                      padding: '2px 6px',
                      borderRadius: '4px',
                      lineHeight: 1.3,
                    }}>
                      {slideNum}
                    </div>

                    {/* Game count badge */}
                    {slideGames.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'var(--accent-blue-bg)',
                        border: '1px solid rgba(31,108,159,0.2)',
                        color: 'var(--accent-blue-text)',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: '4px',
                        lineHeight: 1.3,
                      }}>
                        🎮 {slideGames.length}
                      </div>
                    )}
                  </div>

                  {/* Game type labels below thumbnail */}
                  {slideGames.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '2px',
                      marginTop: '4px',
                      justifyContent: 'center',
                      maxWidth: `${THUMB_WIDTH}px`,
                    }}>
                      {slideGames.map(g => {
                        const p = getPlugin(g.game_type);
                        return (
                          <span
                            key={g.id}
                            className="tag tag-blue"
                            style={{ fontSize: '0.55rem', padding: '1px 5px', lineHeight: 1.4 }}
                          >
                            {p?.label?.split(' ')[0] || g.game_type}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Document>
    </div>
  );
}
