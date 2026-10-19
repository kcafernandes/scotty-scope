import './PrerequisiteVisualizer.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
    COMPACT_LAYOUT,
    LARGE_LAYOUT,
    buildVisibleMap,
    chooseOption,
    chosenOption,
    layoutMap,
    requirementLabel,
    swapGroupsOf,
    swapToken,
} from './prerequisiteMapLogic'
import PrerequisiteMap from './PrerequisiteMap'
import SwapList from './SwapList'
import CoursePeek from './CoursePeek'

const CONSENT_LINE = 'Consent of the instructor may replace these prerequisites.'
const NO_PREREQUISITES_LINE = 'No course prerequisites for this class.'

function PrerequisiteNotes({ course, noPrerequisites }){
    const lines = noPrerequisites ? [NO_PREREQUISITES_LINE, ...course.notes] : [...course.notes]
    if (course.consent_of_instructor) {
        lines.push(CONSENT_LINE)
    }
    if (lines.length === 0) {
        return null
    }
    return (
        <div className="prereq-notes">
            {lines.map((line) => <p key={line}>{line}</p>)}
        </div>
    )
}

function PrerequisiteVisualizer({ courseCode }){
    const navigate = useNavigate()
    const expandButtonRef = useRef(null)
    const [loaded, setLoaded] = useState({ data: null, failed: false })
    const [choices, setChoices] = useState({})
    const [expanded, setExpanded] = useState(false)
    const [peek, setPeek] = useState(null)
    const [swap, setSwap] = useState(null)

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/courses/${encodeURIComponent(courseCode)}/prerequisite-map`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Could not load prerequisite map')
                }
                return response.json()
            })
            .then((data) => setLoaded({ data, failed: false }))
            .catch(() => setLoaded({ data: null, failed: true }))
    }, [courseCode])

    const data = loaded.data
    const visible = useMemo(() => (data ? buildVisibleMap(data, choices) : null), [data, choices])
    const compactLayout = useMemo(() => (visible ? layoutMap(visible, COMPACT_LAYOUT) : null), [visible])
    const largeLayout = useMemo(
        () => (visible && expanded ? layoutMap(visible, LARGE_LAYOUT) : null),
        [visible, expanded],
    )
    const hasChoicesChanged = Object.keys(choices).length > 0
    const mapVersion = JSON.stringify(choices)

    const swapAnchor = swap?.anchor
    const closeSwap = useCallback((returnFocus) => {
        if (returnFocus && swapAnchor?.isConnected) {
            swapAnchor.focus()
        }
        setSwap(null)
    }, [swapAnchor])

    useEffect(() => {
        if (!swap && !peek && !expanded) {
            return
        }
        function handleKeyDown(event) {
            if (event.key !== 'Escape') {
                return
            }
            event.preventDefault()
            if (swap) {
                if (swap.anchor.isConnected) {
                    swap.anchor.focus()
                }
                setSwap(null)
            } else if (peek) {
                if (peek.returnFocus?.isConnected) {
                    peek.returnFocus.focus()
                }
                setPeek(null)
            } else {
                setExpanded(false)
                expandButtonRef.current?.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [swap, peek, expanded])

    function openPeek(code, element) {
        setSwap(null)
        setPeek({ code, returnFocus: element })
    }

    function closePeek() {
        if (peek?.returnFocus?.isConnected) {
            peek.returnFocus.focus()
        }
        setPeek(null)
    }

    function closeExpand() {
        setSwap(null)
        setExpanded(false)
        expandButtonRef.current?.focus()
    }

    function goToCourse(code) {
        setPeek(null)
        setSwap(null)
        setExpanded(false)
        window.scrollTo(0, 0)
        navigate(`/course/${encodeURIComponent(code)}`)
    }

    function openSwap(node, anchor) {
        if (swap?.code === node.code && swap.anchor === anchor) {
            setSwap(null)
            return
        }
        setSwap((current) => ({
            id: (current?.id ?? 0) + 1,
            code: node.code,
            groups: swapGroupsOf(node).map(({ owner, groupIndex }) => ({ owner, groupIndex })),
            anchor,
        }))
    }

    function chooseSwapOption(sectionIndex, code) {
        const { owner, groupIndex } = swap.groups[sectionIndex]
        const group = data.courses[owner].groups[groupIndex]
        const scroller = swap.anchor.closest('.prereq-scroll')
        setChoices((current) => chooseOption(current, owner, groupIndex, group, code))
        setSwap(null)
        requestAnimationFrame(() => {
            const button = scroller?.querySelector(`[data-swap-keys~="${CSS.escape(swapToken(owner, groupIndex))}"]`)
            if (button) {
                button.focus({ preventScroll: true })
                button.closest('.prereq-node').scrollIntoView({ block: 'nearest', inline: 'nearest' })
            }
        })
    }

    const swapSections = swap
        ? swap.groups.map(({ owner, groupIndex }) => {
            const group = data.courses[owner].groups[groupIndex]
            return {
                key: swapToken(owner, groupIndex),
                owner,
                requirement: requirementLabel(groupIndex, data.courses[owner].groups.length),
                options: group,
                chosenCode: chosenOption(choices, owner, groupIndex, group).code,
            }
        })
        : null
    const titles = useMemo(() => {
        if (!data) {
            return {}
        }
        return Object.fromEntries(Object.entries(data.courses).map(([code, course]) => [code, course.title]))
    }, [data])

    const topCourse = data ? data.courses[data.top] : null
    const hasMap = Boolean(data && (data.has_course_prerequisites || topCourse.corequisites.length > 0))
    const onlyPartners = Boolean(data && !data.has_course_prerequisites && hasMap)

    function renderMap(layout, config, large) {
        if (!hasMap) {
            return (
                <div className="prereq-empty">
                    <p>{NO_PREREQUISITES_LINE}</p>
                </div>
            )
        }
        return (
            <PrerequisiteMap
                layout={layout}
                config={config}
                large={large}
                top={data.top}
                version={mapVersion}
                openSwapCode={swap?.code}
                onPeek={openPeek}
                onOpenSwap={openSwap}
                onScroll={() => swap && setSwap(null)}
            />
        )
    }

    function renderHeader(title, closeButton) {
        return (
            <div className="visualizer-header">
                <div className="visualizer-header-left">
                    {hasChoicesChanged && (
                        <button type="button" className="visualizer-button" onClick={() => setChoices({})}>
                            Reset choices
                        </button>
                    )}
                </div>
                {title}
                <div className="visualizer-header-right">{closeButton}</div>
            </div>
        )
    }

    return (
        <div className="info-block block-visualizer">
            {renderHeader(
                <h3>Prerequisite Visualizer</h3>,
                hasMap && (
                    <button
                        type="button"
                        ref={expandButtonRef}
                        className="visualizer-button"
                        aria-haspopup="dialog"
                        onClick={() => setExpanded(true)}
                    >
                        Expand
                    </button>
                ),
            )}

            <div className="visualizer-body">
                {!data && !loaded.failed && <p className="prereq-status">Loading prerequisites...</p>}
                {loaded.failed && <p className="prereq-status">Sorry, the prerequisite map could not be loaded.</p>}
                {data && renderMap(compactLayout, COMPACT_LAYOUT, false)}
                {topCourse && <PrerequisiteNotes course={topCourse} noPrerequisites={onlyPartners} />}
            </div>

            {expanded && largeLayout && createPortal(
                <div
                    className="prereq-overlay-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            event.preventDefault()
                            closeExpand()
                        }
                    }}
                >
                    <div
                        className="prereq-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Prerequisite map for ${data.top}`}
                    >
                        {renderHeader(
                            <h2 className="prereq-overlay-title">Prerequisite Visualizer: {data.top}</h2>,
                            <button
                                type="button"
                                className="visualizer-button visualizer-close"
                                aria-label="Close expanded map"
                                autoFocus
                                onClick={closeExpand}
                            >
                                ×
                            </button>,
                        )}
                        <div className="visualizer-body">
                            {renderMap(largeLayout, LARGE_LAYOUT, true)}
                            <PrerequisiteNotes course={topCourse} noPrerequisites={onlyPartners} />
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {swap && (
                <SwapList
                    key={`${swap.code}-${swap.id}`}
                    anchor={swap.anchor}
                    sections={swapSections}
                    titles={titles}
                    onChoose={chooseSwapOption}
                    onClose={closeSwap}
                />
            )}

            {peek && <CoursePeek code={peek.code} onClose={closePeek} onNavigate={goToCourse} />}
        </div>
    )
}

export default PrerequisiteVisualizer
