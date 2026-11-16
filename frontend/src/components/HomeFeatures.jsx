import { useRevealOnScroll } from './useRevealOnScroll'

function ExampleLabel(){
    return <span className="feature-example-label">Example</span>
}

function DifficultyPicture(){
    return (
        <div className="feature-picture picture-difficulty" aria-hidden="true">
            <ExampleLabel />
            <p className="picture-score">
                <span className="picture-score-value">3.4</span>
                <span className="picture-score-out-of"> / 10</span>
            </p>
            <div className="picture-score-bar">
                <span className="picture-score-fill" />
            </div>
        </div>
    )
}

const MAP_BOXES = [
    { x: 74, y: 8, fade: 'top' },
    { x: 34, y: 48, fade: 100 },
    { x: 114, y: 48, fade: 100 },
    { x: 14, y: 88, fade: 72 },
    { x: 74, y: 88, fade: 72 },
    { x: 134, y: 88, fade: 72 },
]

const MAP_ARROWS = [
    'M 60 48 V 38 H 92 V 28',
    'M 140 48 V 38 H 108 V 28',
    'M 40 88 V 78 H 52 V 68',
    'M 100 88 V 78 H 68 V 68',
    'M 160 88 V 78 H 140 V 68',
]

function MapPicture(){
    return (
        <div className="feature-picture picture-map" aria-hidden="true">
            <ExampleLabel />
            <svg viewBox="0 0 200 112" className="picture-map-svg">
                <defs>
                    <linearGradient id="feature-map-gradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" stopColor="#f43f5e" />
                        <stop offset="1" stopColor="#8b5cf6" />
                    </linearGradient>
                    <marker id="feature-map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" className="picture-map-arrowhead" />
                    </marker>
                </defs>
                {MAP_ARROWS.map((path) => (
                    <path key={path} d={path} className="picture-map-arrow" markerEnd="url(#feature-map-arrow)" />
                ))}
                {MAP_BOXES.map((box) => (
                    <rect
                        key={`${box.x}-${box.y}`}
                        x={box.x}
                        y={box.y}
                        width="52"
                        height="20"
                        rx="6"
                        className="picture-map-box"
                        style={box.fade === 'top' ? { fill: 'url(#feature-map-gradient)' } : { '--fade': `${box.fade}%` }}
                    />
                ))}
            </svg>
        </div>
    )
}

function ReviewsPicture(){
    return (
        <div className="feature-picture picture-reviews" aria-hidden="true">
            <ExampleLabel />
            {[['92%', '64%'], ['84%', '52%']].map((bars, index) => (
                <div key={index} className="picture-review">
                    <span className="picture-review-label">Difficulty 4/10</span>
                    {bars.map((width) => (
                        <span key={width} className="picture-review-line" style={{ width }} />
                    ))}
                </div>
            ))}
        </div>
    )
}

const FEATURES = [
    {
        title: 'See how hard it really is',
        text: 'Average difficulty from real students, from 1 (easiest) to 10 (hardest).',
        Picture: DifficultyPicture,
    },
    {
        title: 'Map every prerequisite',
        text: 'See every class you need, in order, and swap between options.',
        Picture: MapPicture,
    },
    {
        title: 'Read real student reviews',
        text: 'Honest written feedback from students who took the class.',
        Picture: ReviewsPicture,
    },
]

function FeatureCard({ title, text, Picture, index }){
    const [ref, revealClass] = useRevealOnScroll()
    return (
        <article ref={ref} className={`home-feature-card ${revealClass}`} style={{ '--reveal-delay': `${index * 130}ms` }}>
            <Picture />
            <h3 className="home-feature-title">{title}</h3>
            <p className="home-feature-text">{text}</p>
        </article>
    )
}

function HomeFeatures(){
    const [headingRef, headingRevealClass] = useRevealOnScroll()
    return (
        <section className="home-features" aria-labelledby="home-features-heading">
            <h2 ref={headingRef} id="home-features-heading" className={`home-features-heading ${headingRevealClass}`}>
                Everything you need before you register
            </h2>
            <div className="home-feature-grid">
                {FEATURES.map((feature, index) => (
                    <FeatureCard key={feature.title} {...feature} index={index} />
                ))}
            </div>
        </section>
    )
}

export default HomeFeatures
