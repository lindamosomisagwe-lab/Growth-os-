import React, { useState, useMemo } from 'react';
import { RESOURCES, DIMENSION_META, getResourcesForDimension } from '../data/resources';

const TYPE_LABELS = {
  book: { label: 'Book', icon: '📚' },
  video: { label: 'Video', icon: '▶️' },
  podcast: { label: 'Podcast', icon: '🎙' },
  article: { label: 'Article', icon: '📄' },
};

function BookCard({ resource }) {
  return (
    <div className="resource-card resource-card--book">
      <div className="resource-book-cover">
        <img
          src={resource.coverImageUrl}
          alt={resource.title}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="resource-book-cover-fallback" style={{ display: 'none' }}>
          <span>📚</span>
        </div>
      </div>
      <div className="resource-card-body">
        <span className="resource-type-badge resource-type-badge--book">Book</span>
        <h4 className="resource-title">{resource.title}</h4>
        <p className="resource-author">{resource.author}</p>
        <p className="resource-description">{resource.description}</p>
        <div className="resource-book-links">
          {resource.amazonLink && (
            <a href={resource.amazonLink} target="_blank" rel="noopener noreferrer" className="resource-link resource-link--amazon">
              Amazon
            </a>
          )}
          {resource.audibleLink && (
            <a href={resource.audibleLink} target="_blank" rel="noopener noreferrer" className="resource-link resource-link--audible">
              Audible
            </a>
          )}
          {resource.goodreadsLink && (
            <a href={resource.goodreadsLink} target="_blank" rel="noopener noreferrer" className="resource-link resource-link--goodreads">
              Goodreads
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoCard({ resource, compact = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${resource.youtubeId}/mqdefault.jpg`;
  const isTypePodcast = resource.type === 'podcast';

  if (compact) {
    return (
      <div className="resource-card resource-card--video resource-card--compact">
        <div className="resource-video-thumb-compact" onClick={() => setIsPlaying(true)}>
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${resource.youtubeId}?autoplay=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={resource.title}
            />
          ) : (
            <>
              <img src={thumbnailUrl} alt={resource.title} />
              <button className="resource-play-btn" aria-label="Play">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </>
          )}
        </div>
        <div className="resource-card-body resource-card-body--compact">
          <span className={`resource-type-badge resource-type-badge--${resource.type}`}>
            {isTypePodcast ? '🎙 Podcast' : '▶ Video'}
          </span>
          <h4 className="resource-title resource-title--compact">{resource.title}</h4>
          <p className="resource-author">{resource.author}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-card resource-card--video">
      <div className="resource-video-embed" onClick={() => setIsPlaying(true)}>
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${resource.youtubeId}?autoplay=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={resource.title}
          />
        ) : (
          <>
            <img src={thumbnailUrl} alt={resource.title} />
            <button className="resource-play-btn" aria-label="Play">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <div className="resource-video-duration-badge">
              {isTypePodcast ? '🎙 Podcast' : '▶ Watch'}
            </div>
          </>
        )}
      </div>
      <div className="resource-card-body">
        <span className={`resource-type-badge resource-type-badge--${resource.type}`}>
          {TYPE_LABELS[resource.type]?.icon} {TYPE_LABELS[resource.type]?.label}
        </span>
        <h4 className="resource-title">{resource.title}</h4>
        <p className="resource-author">{resource.author}{resource.source && ` · ${resource.source}`}</p>
        <p className="resource-description">{resource.description}</p>
      </div>
    </div>
  );
}

function ArticleCard({ resource }) {
  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className="resource-card resource-card--article resource-card--link"
    >
      <div className="resource-article-icon">📄</div>
      <div className="resource-card-body">
        <span className="resource-type-badge resource-type-badge--article">Article</span>
        <h4 className="resource-title">{resource.title}</h4>
        <p className="resource-author">{resource.author}</p>
        <p className="resource-description">{resource.description}</p>
        <span className="resource-external-link-hint">Open article →</span>
      </div>
    </a>
  );
}

function ResourceCard({ resource, compact = false }) {
  switch (resource.type) {
    case 'book':
      return <BookCard resource={resource} />;
    case 'video':
    case 'podcast':
      return <VideoCard resource={resource} compact={compact} />;
    case 'article':
      return <ArticleCard resource={resource} />;
    default:
      return null;
  }
}

function DimensionSection({ dimensionKey, resources, isActive, onToggle }) {
  const meta = DIMENSION_META[dimensionKey];

  return (
    <section className="library-dimension-section" id={`lib-${dimensionKey}`}>
      <button
        className={`library-dimension-header ${isActive ? 'library-dimension-header--open' : ''}`}
        onClick={onToggle}
        style={{ '--dimension-color': meta.color }}
      >
        <div className="library-dimension-header-left">
          <span className="library-dimension-icon">{meta.icon}</span>
          <div>
            <h3 className="library-dimension-label">{meta.label}</h3>
            <p className="library-dimension-desc">{meta.description}</p>
          </div>
        </div>
        <div className="library-dimension-header-right">
          <span className="library-resource-count">{resources.length} resources</span>
          <span className="library-chevron">{isActive ? '▲' : '▼'}</span>
        </div>
      </button>

      {isActive && (
        <div className="library-dimension-grid">
          {/* Books row */}
          {resources.filter(r => r.type === 'book').length > 0 && (
            <div className="library-resource-group">
              <h4 className="library-resource-group-title">📚 Recommended Books</h4>
              <div className="library-books-row">
                {resources.filter(r => r.type === 'book').map(r => (
                  <BookCard key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}

          {/* Videos & Podcasts row */}
          {resources.filter(r => r.type === 'video' || r.type === 'podcast').length > 0 && (
            <div className="library-resource-group">
              <h4 className="library-resource-group-title">▶ Videos & Podcasts</h4>
              <div className="library-videos-row">
                {resources.filter(r => r.type === 'video' || r.type === 'podcast').map(r => (
                  <VideoCard key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}

          {/* Articles row */}
          {resources.filter(r => r.type === 'article').length > 0 && (
            <div className="library-resource-group">
              <h4 className="library-resource-group-title">📄 Articles & Reading</h4>
              <div className="library-articles-row">
                {resources.filter(r => r.type === 'article').map(r => (
                  <ArticleCard key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function LibraryView() {
  const [activeDimensions, setActiveDimensions] = useState(new Set(['mental_health']));
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const dimensions = Object.keys(DIMENSION_META);

  const toggleDimension = (key) => {
    setActiveDimensions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => setActiveDimensions(new Set(dimensions));
  const collapseAll = () => setActiveDimensions(new Set());

  const filteredByDimension = useMemo(() => {
    const result = {};
    dimensions.forEach(dim => {
      let resources = getResourcesForDimension(dim);
      if (filterType !== 'all') {
        resources = resources.filter(r => {
          if (filterType === 'video') return r.type === 'video' || r.type === 'podcast';
          return r.type === filterType;
        });
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        resources = resources.filter(r =>
          r.title.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      result[dim] = resources;
    });
    return result;
  }, [filterType, searchQuery, dimensions]);

  const totalCount = Object.values(filteredByDimension).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="library-view">
      {/* Header */}
      <div className="library-header">
        <div className="library-header-text">
          <h1 className="library-title">Resource Library</h1>
          <p className="library-subtitle">
            Curated books, videos, and podcasts — organized by the eight dimensions of your life.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="library-controls">
        <div className="library-search-wrapper">
          <span className="library-search-icon">🔍</span>
          <input
            type="text"
            className="library-search"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="library-search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="library-filter-pills">
          {[
            { key: 'all', label: 'All' },
            { key: 'book', label: '📚 Books' },
            { key: 'video', label: '▶ Videos' },
            { key: 'article', label: '📄 Articles' },
          ].map(f => (
            <button
              key={f.key}
              className={`library-filter-pill ${filterType === f.key ? 'library-filter-pill--active' : ''}`}
              onClick={() => setFilterType(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="library-expand-controls">
          <button className="library-expand-btn" onClick={expandAll}>Expand all</button>
          <button className="library-expand-btn" onClick={collapseAll}>Collapse all</button>
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || filterType !== 'all') && (
        <p className="library-results-count">
          {totalCount} {totalCount === 1 ? 'resource' : 'resources'} found
        </p>
      )}

      {/* Dimension Quick Nav */}
      <div className="library-dimension-nav">
        {dimensions.map(dim => {
          const meta = DIMENSION_META[dim];
          const count = filteredByDimension[dim]?.length || 0;
          return (
            <button
              key={dim}
              className={`library-dim-nav-btn ${activeDimensions.has(dim) ? 'library-dim-nav-btn--active' : ''} ${count === 0 ? 'library-dim-nav-btn--empty' : ''}`}
              onClick={() => {
                toggleDimension(dim);
                document.getElementById(`lib-${dim}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{ '--dimension-color': meta.color }}
            >
              <span>{meta.icon}</span>
              <span className="library-dim-nav-label">{meta.label}</span>
              {count > 0 && <span className="library-dim-nav-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Sections */}
      <div className="library-sections">
        {dimensions.map(dim => {
          const resources = filteredByDimension[dim];
          if (resources.length === 0) return null;
          return (
            <DimensionSection
              key={dim}
              dimensionKey={dim}
              resources={resources}
              isActive={activeDimensions.has(dim)}
              onToggle={() => toggleDimension(dim)}
            />
          );
        })}
        {totalCount === 0 && (
          <div className="library-empty-state">
            <p>🔍 No resources match your search.</p>
            <button onClick={() => { setSearchQuery(''); setFilterType('all'); }} className="btn btn-secondary">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export resource card for use elsewhere (e.g. Goals detail view, post-assessment prompt)
export { ResourceCard, VideoCard, BookCard };
