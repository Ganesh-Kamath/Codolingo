import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '../ui/Icon';

interface SortableItemProps {
  id: string;
  item: string;
  index: number;
  disabled?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  item,
  index,
  disabled,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 50 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    backgroundColor: isDragging ? 'var(--brand-light)' : 'var(--bg-surface)',
    border: `1.5px solid ${isDragging ? 'var(--brand-primary)' : 'var(--border-default)'}`,
    boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--tactile-card)',
    borderRadius: 'var(--radius-lg)',
    cursor: disabled ? 'default' : 'grab',
    touchAction: 'none',
    userSelect: 'none'
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag Grip Handle */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          aria-label={`Drag item ${index + 1}`}
          style={{
            cursor: 'grab',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
        >
          <Icon name="grip-vertical" size={18} />
        </div>
      )}

      {/* Step Number Badge */}
      <span
        style={{
          width: '26px',
          height: '26px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          flexShrink: 0
        }}
      >
        {index + 1}
      </span>

      {/* Code Text */}
      <code
        style={{
          flex: 1,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.4
        }}
      >
        {item}
      </code>

      {/* Accessible Keyboard Fallback Controls */}
      {!disabled && (
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} className="desktop-only">
          <button
            type="button"
            aria-label={`Move line ${index + 1} up`}
            disabled={!canMoveUp}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.();
            }}
            style={{
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              color: canMoveUp ? 'var(--text-secondary)' : 'var(--text-muted)',
              cursor: canMoveUp ? 'pointer' : 'default',
              opacity: canMoveUp ? 1 : 0.3
            }}
          >
            <Icon name="chevron-up" size={14} />
          </button>
          <button
            type="button"
            aria-label={`Move line ${index + 1} down`}
            disabled={!canMoveDown}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.();
            }}
            style={{
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              color: canMoveDown ? 'var(--text-secondary)' : 'var(--text-muted)',
              cursor: canMoveDown ? 'pointer' : 'default',
              opacity: canMoveDown ? 1 : 0.3
            }}
          >
            <Icon name="chevron-down" size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export interface SortableCodeListProps {
  items: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
}

export const SortableCodeList: React.FC<SortableCodeListProps> = ({
  items,
  onChange,
  disabled = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, idx) => `item-${idx}` === active.id);
      const newIndex = items.findIndex((_, idx) => `item-${idx}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex >= 0 && toIndex < items.length) {
      onChange(arrayMove(items, fromIndex, toIndex));
    }
  };

  // Unique item IDs mapped to stable item keys
  const itemIds = items.map((_, idx) => `item-${idx}`);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2.5)' }}>
          {items.map((item, idx) => (
            <SortableItem
              key={`item-${idx}`}
              id={`item-${idx}`}
              item={item}
              index={idx}
              disabled={disabled}
              canMoveUp={idx > 0}
              canMoveDown={idx < items.length - 1}
              onMoveUp={() => handleMove(idx, idx - 1)}
              onMoveDown={() => handleMove(idx, idx + 1)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
