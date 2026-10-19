import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { boxTags } from './prerequisiteMapLogic'

const LIST_WIDTH = 300
const LIST_MAX_HEIGHT = 340
const EDGE_SPACE = 12

function placeNextTo(anchor) {
    const rect = anchor.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - EDGE_SPACE
    const spaceAbove = rect.top - EDGE_SPACE
    const openBelow = spaceBelow >= 200 || spaceBelow >= spaceAbove
    const maxHeight = Math.min(LIST_MAX_HEIGHT, openBelow ? spaceBelow : spaceAbove)
    const width = Math.min(LIST_WIDTH, window.innerWidth - EDGE_SPACE * 2)
    const left = Math.min(
        Math.max(EDGE_SPACE, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - EDGE_SPACE,
    )
    return openBelow
        ? { left, width, maxHeight, top: rect.bottom + 6 }
        : { left, width, maxHeight, bottom: window.innerHeight - rect.top + 6 }
}

function SwapSection({ section, sectionIndex, titles, onChoose }){
    const headingId = useId()
    return (
        <div className="swap-section">
            <div className="swap-heading" id={headingId}>
                <span className="swap-heading-title">Choose one for {section.owner}</span>
                {section.requirement && <span className="swap-heading-requirement">{section.requirement}</span>}
            </div>
            <ul className="swap-list" role="listbox" aria-labelledby={headingId}>
                {section.options.map((option) => {
                    const tags = boxTags(option)
                    const isChosen = option.code === section.chosenCode
                    return (
                        <li
                            key={option.code}
                            role="option"
                            aria-selected={isChosen}
                            tabIndex={-1}
                            data-section={sectionIndex}
                            data-code={option.code}
                            className={isChosen ? 'swap-option is-chosen' : 'swap-option'}
                            title={option.concurrent ? 'Can be taken at the same time.' : undefined}
                            onClick={() => onChoose(sectionIndex, option.code)}
                        >
                            <span className="swap-option-mark" aria-hidden="true">{isChosen ? '✓' : ''}</span>
                            <span className="swap-option-code">{option.code}</span>
                            <span className="swap-option-title">
                                {titles[option.code] ?? 'Not in our course list'}
                                {option.concurrent && <span className="sr-only">. Can be taken at the same time.</span>}
                            </span>
                            {tags.length > 0 && (
                                <span className="swap-option-tags">
                                    {tags.map((tag) => <span key={tag} className="prereq-tag-chip">{tag}</span>)}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

function SwapList({ anchor, sections, titles, onChoose, onClose }){
    const popoverRef = useRef(null)
    const [position] = useState(() => placeNextTo(anchor))

    useLayoutEffect(() => {
        const chosenItem = popoverRef.current.querySelector('[role=option][aria-selected=true]')
            ?? popoverRef.current.querySelector('[role=option]')
        chosenItem?.focus({ preventScroll: true })
        chosenItem?.scrollIntoView({ block: 'nearest' })
    }, [])

    useEffect(() => {
        function handlePointerDown(event) {
            if (!popoverRef.current?.contains(event.target) && !anchor.contains(event.target)) {
                onClose(false)
            }
        }
        function handleResize() {
            onClose(false)
        }
        document.addEventListener('mousedown', handlePointerDown)
        window.addEventListener('resize', handleResize)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            window.removeEventListener('resize', handleResize)
        }
    }, [anchor, onClose])

    function handleKeyDown(event) {
        const items = [...popoverRef.current.querySelectorAll('[role=option]')]
        const current = items.indexOf(document.activeElement)
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const step = event.key === 'ArrowDown' ? 1 : -1
            items[(current + step + items.length) % items.length].focus()
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            items[event.key === 'Home' ? 0 : items.length - 1].focus()
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (current >= 0) {
                onChoose(Number(items[current].dataset.section), items[current].dataset.code)
            }
        } else if (event.key === 'Tab') {
            event.preventDefault()
            onClose(true)
        }
    }

    return createPortal(
        <div ref={popoverRef} className="swap-popover" style={position} onKeyDown={handleKeyDown}>
            {sections.map((section, sectionIndex) => (
                <SwapSection
                    key={section.key}
                    section={section}
                    sectionIndex={sectionIndex}
                    titles={titles}
                    onChoose={onChoose}
                />
            ))}
        </div>,
        document.body,
    )
}

export default SwapList
