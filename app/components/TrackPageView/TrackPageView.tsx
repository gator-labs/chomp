"use client"
import { useEffect, useRef } from 'react'
import trackEvent from '@/lib/trackEvent'
import { TRACKING_EVENTS, TRACKING_METADATA } from '@/app/constants/tracking'
import { usePathname, useSearchParams } from 'next/navigation'

function TrackPageView() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const url = `${pathname}?${searchParams}`
    
    // Use a ref to store the previous URL
    const prevUrlRef = useRef(url)

    useEffect(() => {
        const prevUrl = prevUrlRef.current
        
        if (prevUrl !== url) {
            // URL has changed, track the event
            trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
                [TRACKING_METADATA.URL_PATH]: pathname,
                [TRACKING_METADATA.URL_SEARCH]: Object.fromEntries(searchParams.entries())
            })
        }

        // Update the ref with the current URL
        prevUrlRef.current = url
    }, [url, pathname, searchParams])

    return null
}

export default TrackPageView
