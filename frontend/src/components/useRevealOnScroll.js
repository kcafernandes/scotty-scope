import { useEffect, useRef, useState } from 'react'

function canAnimate() {
    return typeof window !== 'undefined'
        && 'IntersectionObserver' in window
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useRevealOnScroll() {
    const ref = useRef(null)
    const [state, setState] = useState('shown')

    useEffect(() => {
        const element = ref.current
        if (!element || !canAnimate()) {
            return
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                setState('revealed')
                observer.disconnect()
            }
        }, { threshold: 0.1 })
        const frame = requestAnimationFrame(() => {
            setState((current) => (current === 'shown' ? 'waiting' : current))
            observer.observe(element)
        })
        return () => {
            cancelAnimationFrame(frame)
            observer.disconnect()
        }
    }, [])

    const className = state === 'waiting' ? 'reveal is-waiting' : state === 'revealed' ? 'reveal is-revealed' : ''
    return [ref, className]
}
