import { useCallback, useRef } from 'react';

export const useDragAndDrop = () => {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = useCallback((e, item, index) => {
    dragItem.current = { item, index };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, index }));
    
    // Add dragging class
    e.target.classList.add('dragging');
  }, []);

  const handleDragEnter = useCallback((e, item, index) => {
    dragOverItem.current = { item, index };
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback((e, onReorder) => {
    e.target.classList.remove('dragging');
    
    if (
      dragItem.current &&
      dragOverItem.current &&
      dragItem.current.index !== dragOverItem.current.index
    ) {
      onReorder?.(dragItem.current.index, dragOverItem.current.index);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, onDrop) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop?.(data, e);
  }, []);

  return {
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
};
