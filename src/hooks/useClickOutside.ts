import { useEffect, useRef } from 'react';

export function useClickOutside(handler: () => void) {
    const domNode = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const maybeHandler = (event: MouseEvent) => {
            if (domNode.current && !domNode.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener("mousedown", maybeHandler, { capture: true });

        return () => {
            document.removeEventListener("mousedown", maybeHandler, { capture: true });
        };
    }, [handler]);

    return domNode;
}
