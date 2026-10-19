import { useId, useLayoutEffect, useRef, useState } from 'react'
import { boxTags, neededForText, partnerText, requirementLabel, swapGroupsOf, swapToken } from './prerequisiteMapLogic'

function fadeForLevel(level) {
    return `${Math.min(100, Math.max(42, 100 - 14 * (level - 1)))}%`
}

function CourseBox({ node, isTop, onPeek }){
    const tags = boxTags(node.link)
    const details = [neededForText(node.neededFor, node.partners), partnerText(node.partners)].filter(Boolean).join(' ')
    const style = { height: node.boxHeight, '--fade': fadeForLevel(node.level) }
    const content = (
        <>
            <span className="prereq-code">{node.code}</span>
            {tags.map((tag) => <span key={tag} className="prereq-tag">{tag}</span>)}
        </>
    )

    if (isTop) {
        return (
            <div className="prereq-box is-top" style={style} title={[node.title, details].filter(Boolean).join('. ')}>
                {content}
                {details && <span className="sr-only">. {details}</span>}
            </div>
        )
    }

    if (!node.inDatabase) {
        return (
            <div className="prereq-box not-listed" style={style} title={`not in our course list. ${details}`}>
                {content}
                <span className="sr-only">, not in our course list. {details}</span>
            </div>
        )
    }

    return (
        <button
            type="button"
            className="prereq-box"
            style={style}
            title={`${node.title}. ${details} Click to peek at this course.`}
            aria-label={`Peek at ${node.code}, ${node.title}${tags.length > 0 ? `, ${tags.join(', ')}` : ''}. ${details}`}
            onClick={(event) => onPeek(node.code, event.currentTarget)}
        >
            {content}
        </button>
    )
}

function describeNeed(need) {
    const requirement = requirementLabel(need.groupIndex, need.groupCount)
    return `${need.owner}${requirement ? ` (${requirement})` : ''}`
}

function SwapButton({ node, config, large, isOpen, onOpenSwap }){
    const groups = swapGroupsOf(node)
    const single = groups.length === 1 ? groups[0] : null
    const label = single
        ? (large ? `Swap out course? (${single.optionCount} options)` : `Swap? (${single.optionCount})`)
        : (large ? `Swap out course? (${groups.length} reqs)` : `Swap? (${groups.length} reqs)`)
    const description = single
        ? `${single.optionCount} options for ${describeNeed(single)}`
        : `it fills ${groups.length} requirements: ${groups.map(describeNeed).join(' and ')}`

    return (
        <button
            type="button"
            className="prereq-swap"
            style={{ height: config.swapHeight, marginTop: config.swapGap }}
            data-swap-keys={groups.map((need) => swapToken(need.owner, need.groupIndex)).join(' ')}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={`Swap out ${node.code}: ${description}`}
            title={`Choose another course for ${groups.map(describeNeed).join(' or ')}`}
            onClick={(event) => onOpenSwap(node, event.currentTarget)}
        >
            {label}
        </button>
    )
}

function ArrowMarker({ id, className }){
    return (
        <marker
            id={id}
            className={className}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
        >
            <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
    )
}

function PrerequisiteMap({ layout, config, large, top, version, openSwapCode, onPeek, onOpenSwap, onScroll }){
    const scrollRef = useRef(null)
    const viewRef = useRef(null)
    const markerId = `arrow-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
    const [highlighted, setHighlighted] = useState(null)

    const highlightedExists = highlighted !== null && layout.nodes.some((node) => node.code === highlighted)
    const related = new Set()
    if (highlightedExists) {
        related.add(highlighted)
        for (const link of [...layout.arrows.map((arrow) => [arrow.from, arrow.to]), ...layout.pairLines.map((line) => [line.a, line.b])]) {
            if (link.includes(highlighted)) {
                related.add(link[0])
                related.add(link[1])
            }
        }
    }

    function lineClass(line) {
        if (!highlightedExists) {
            return 'pair-line'
        }
        return line.a === highlighted || line.b === highlighted ? 'pair-line is-active' : 'pair-line is-dimmed'
    }

    function arrowClass(arrow) {
        if (!highlightedExists) {
            return undefined
        }
        return arrow.from === highlighted || arrow.to === highlighted ? 'is-active' : 'is-dimmed'
    }

    function nodeClass(code) {
        if (!highlightedExists) {
            return 'prereq-node'
        }
        if (code === highlighted) {
            return 'prereq-node is-highlighted'
        }
        return related.has(code) ? 'prereq-node is-related' : 'prereq-node is-dimmed'
    }

    const orderedArrows = highlightedExists
        ? [...layout.arrows].sort((a, b) => (arrowClass(a) === 'is-active') - (arrowClass(b) === 'is-active'))
        : layout.arrows

    const topCenter = layout.focusCenter
    const width = layout.width

    useLayoutEffect(() => {
        const scroller = scrollRef.current
        const canvas = scroller.querySelector('.prereq-canvas')
        const topPosition = canvas.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft + topCenter
        const previous = viewRef.current
        if (!previous || previous.top !== top) {
            scroller.scrollLeft = topPosition - scroller.clientWidth / 2
            scroller.scrollTop = 0
        } else if (previous.topPosition !== topPosition) {
            scroller.scrollLeft += topPosition - previous.topPosition
        }
        viewRef.current = { top, topPosition }
    }, [top, topCenter, width])

    return (
        <div className="prereq-scroll" ref={scrollRef} onScroll={onScroll}>
            <div
                className="prereq-stage"
                style={{
                    paddingLeft: `max(0px, calc(50% - ${topCenter}px))`,
                    paddingRight: `max(0px, calc(50% - ${width - topCenter}px))`,
                }}
            >
                <div
                    key={version}
                    className={`prereq-canvas${large ? ' is-large' : ''}${highlightedExists ? ' is-tracing' : ''}`}
                    style={{ width: layout.width, height: layout.height }}
                >
                    <svg className="prereq-arrows" width={layout.width} height={layout.height} aria-hidden="true">
                        <defs>
                            <ArrowMarker id={markerId} />
                            <ArrowMarker id={`${markerId}-active`} className="active-marker" />
                        </defs>
                        {orderedArrows.map((arrow) => {
                            const className = arrowClass(arrow)
                            return (
                                <path
                                    key={`${arrow.from}>${arrow.to}`}
                                    className={className}
                                    d={arrow.path}
                                    markerEnd={`url(#${className === 'is-active' ? `${markerId}-active` : markerId})`}
                                />
                            )
                        })}
                        {layout.pairLines.map((line) => (
                            <line
                                key={`${line.a}+${line.b}`}
                                className={lineClass(line)}
                                x1={line.x1}
                                y1={line.y}
                                x2={line.x2}
                                y2={line.y}
                            />
                        ))}
                    </svg>

                    {layout.nodes.map((node) => (
                        <div
                            key={node.code}
                            className={nodeClass(node.code)}
                            style={{ left: node.left, top: node.top, width: config.boxWidth }}
                            onMouseEnter={() => setHighlighted(node.code)}
                            onMouseLeave={() => setHighlighted(null)}
                            onFocus={() => setHighlighted(node.code)}
                            onBlur={() => setHighlighted(null)}
                        >
                            <CourseBox node={node} isTop={node.code === top} onPeek={onPeek} />
                            {node.hasSwap && (
                                <SwapButton
                                    node={node}
                                    config={config}
                                    large={large}
                                    isOpen={openSwapCode === node.code}
                                    onOpenSwap={onOpenSwap}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PrerequisiteMap
