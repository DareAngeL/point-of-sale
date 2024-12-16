import { useEffect, useRef } from "react";

interface ItemClassWidgetBehavior {
  listener: {
    onReachedEnd: ()=>void
  }
}

export function useItemClassWidgetBehavior(props?: ItemClassWidgetBehavior) {

  const containerRef = useRef<HTMLDivElement>(null);

  const firstPointX = useRef(-1)
  const isPointerDown = useRef<boolean>(false);

  useEffect(() => {
    if (containerRef.current === null) return;
    const _container = containerRef.current;

    _container.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    return () => {
      _container.removeEventListener('pointerdown', onPointerDown);
      _container.removeEventListener('pointermove', onPointerMove);
      _container.removeEventListener('pointerup', onPointerUp);
    }
  }, [])

  const onPointerDown = (e: PointerEvent) => {
    e.preventDefault();

    isPointerDown.current = true;
    firstPointX.current = e.clientX;
  }

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    const pointX = e.clientX;
    
    if (isPointerDown.current) {
      const deltaX = pointX - firstPointX.current;
      const _container = containerRef.current;
      if (_container === null) return;
      
      _container.scroll(_container.scrollLeft + -deltaX, 0);
      // if the scrolling reached to the end
      if (
        _container.scrollLeft + _container.clientWidth >= _container.scrollWidth ||
        _container.scrollLeft <= 0
      ) {
        _container.style.transform += `translateX(${deltaX * .2}px)`;

        if (_container.scrollLeft + _container.clientWidth >= _container.scrollWidth) {
          props?.listener.onReachedEnd();
        }
      }

      firstPointX.current = pointX;
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault();

    isPointerDown.current = false;
    const _container = containerRef.current;
    if (_container === null) return;

    _container.style.transition = 'transform .2s ease-out'
    _container.style.transform = `translateX(0px)`;
  }

  return {
    containerRef
  }
}