import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  
  // Simple logic to show a window of pages
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);
  
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2 mt-4", className)}>
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {startPage > 1 && (
        <>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onPageChange(1)}>1</Button>
          {startPage > 2 && <MoreHorizontal className="h-4 w-4 text-muted-foreground mx-1" />}
        </>
      )}

      {pages.map(p => (
        <Button
          key={p}
          variant={currentPage === p ? "default" : "ghost"}
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <MoreHorizontal className="h-4 w-4 text-muted-foreground mx-1" />}
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
