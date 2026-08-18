import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Users,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  CheckCircle2,
  Clock,
  Bookmark,
  Pencil,
  Trash2,
  Focus,
  Hand,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-currency';
import { CompassRose } from './compass-rose';
import type { StoreTable } from '@/types/table.types';

interface TableCanvasProps {
  tables: StoreTable[];
  selectedTableId?: string | null;
  onSelectTable?: (table: StoreTable) => void;
  onUpdateTableLayout?: (
    tableId: string,
    updates: { x: number; y: number; width: number; height: number }
  ) => void;
  onEditTableDetails?: (table: StoreTable) => void;
  onDeleteTable?: (table: StoreTable) => void;
  isEditable?: boolean;
}

const GRID_SIZE = 20;

export const TableCanvas: React.FC<TableCanvasProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onUpdateTableLayout,
  onEditTableDetails,
  onDeleteTable,
  isEditable = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport Pan & Zoom state (Floorplanner Infinite Canvas)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [zoom, setZoom] = useState<number>(1);
  const [orientationDeg, setOrientationDeg] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Interaction States
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const panStartRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number }>({
    startX: 0,
    startY: 0,
    startPanX: 60,
    startPanY: 60,
  });

  // Dragging state for tables
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resizing state for tables
  const [resizingTableId, setResizingTableId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  // Helper: Snap value to grid
  const snap = useCallback(
    (val: number) => {
      if (!snapToGrid) return val;
      return Math.round(val / GRID_SIZE) * GRID_SIZE;
    },
    [snapToGrid]
  );

  // Keyboard Spacebar listener for temporary pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle Canvas Background Mouse Down (Start Pan)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if left click on canvas or space is held or middle click
    if (e.button === 0 || e.button === 1) {
      if (
        (e.target as HTMLElement).closest('.table-item-card') ||
        (e.target as HTMLElement).closest('.canvas-toolbar')
      ) {
        return;
      }

      setIsPanning(true);
      panStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
    }
  };

  // Start dragging a table
  const handleMouseDownTable = (e: React.MouseEvent, table: StoreTable) => {
    if (isSpacePressed) {
      // If spacebar is held, prefer panning
      setIsPanning(true);
      panStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
      return;
    }

    if (!isEditable) {
      onSelectTable?.(table);
      return;
    }
    if (
      (e.target as HTMLElement).closest('.resize-handle') ||
      (e.target as HTMLElement).closest('.table-action-btn')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onSelectTable?.(table);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingTableId(table.id);
    setDragOffset({
      x: mouseX - table.x,
      y: mouseY - table.y,
    });
  };

  // Start resizing a table
  const handleMouseDownResize = (e: React.MouseEvent, table: StoreTable) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();

    onSelectTable?.(table);
    setResizingTableId(table.id);
    setResizeStart({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: table.width,
      startHeight: table.height,
    });
  };

  // Wheel Zoom / Pan handling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Smooth Zoom
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(2.5, Math.max(0.4, Number((zoom * zoomFactor).toFixed(2))));

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered around mouse pointer
    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // Pusatkan View (Center & Fit all tables)
  const handleCenterView = () => {
    if (tables.length === 0) {
      setPan({ x: 60, y: 60 });
      setZoom(1);
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const minX = Math.min(...tables.map((t) => t.x));
    const maxX = Math.max(...tables.map((t) => t.x + t.width));
    const minY = Math.min(...tables.map((t) => t.y));
    const maxY = Math.max(...tables.map((t) => t.y + t.height));

    const contentWidth = Math.max(200, maxX - minX + 120);
    const contentHeight = Math.max(200, maxY - minY + 120);

    const scaleX = rect.width / contentWidth;
    const scaleY = rect.height / contentHeight;
    const fitZoom = Math.min(1.2, Math.max(0.5, Math.min(scaleX, scaleY) * 0.85));

    const centerX = rect.width / 2 - ((minX + maxX) / 2) * fitZoom;
    const centerY = rect.height / 2 - ((minY + maxY) / 2) * fitZoom;

    setZoom(Number(fitZoom.toFixed(2)));
    setPan({ x: Math.round(centerX), y: Math.round(centerY) });
  };

  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const onUpdateLayoutRef = useRef(onUpdateTableLayout);
  onUpdateLayoutRef.current = onUpdateTableLayout;

  // Global mouse move and up listeners
  useEffect(() => {
    if (!isPanning && !draggingTableId && !resizingTableId) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 1. Panning Canvas
      if (isPanning) {
        const dx = e.clientX - panStartRef.current.startX;
        const dy = e.clientY - panStartRef.current.startY;
        setPan({
          x: Math.round(panStartRef.current.startPanX + dx),
          y: Math.round(panStartRef.current.startPanY + dy),
        });
        return;
      }

      // 2. Dragging Table
      if (draggingTableId) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;

        let newX = mouseX - dragOffset.x;
        let newY = mouseY - dragOffset.y;

        newX = Math.max(0, snap(newX));
        newY = Math.max(0, snap(newY));

        const targetTable = tablesRef.current.find((t) => t.id === draggingTableId);
        if (targetTable) {
          onUpdateLayoutRef.current?.(draggingTableId, {
            x: newX,
            y: newY,
            width: targetTable.width,
            height: targetTable.height,
          });
        }
        return;
      }

      // 3. Resizing Table
      if (resizingTableId) {
        const deltaX = (e.clientX - resizeStart.startX) / zoom;
        const deltaY = (e.clientY - resizeStart.startY) / zoom;

        let newWidth = resizeStart.startWidth + deltaX;
        let newHeight = resizeStart.startHeight + deltaY;

        newWidth = Math.max(60, snap(newWidth));
        newHeight = Math.max(60, snap(newHeight));

        const targetTable = tablesRef.current.find((t) => t.id === resizingTableId);
        if (targetTable) {
          onUpdateLayoutRef.current?.(resizingTableId, {
            x: targetTable.x,
            y: targetTable.y,
            width: newWidth,
            height: newHeight,
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingTableId(null);
      setResizingTableId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isPanning,
    draggingTableId,
    resizingTableId,
    dragOffset,
    resizeStart,
    zoom,
    pan,
    snap,
  ]);

  const getStatusBadge = (table: StoreTable) => {
    if (table.status === 'OCCUPIED') {
      return (
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold"
        >
          <Clock className="h-2.5 w-2.5 mr-0.5" />
          Terisi
        </Badge>
      );
    }
    if (table.status === 'RESERVED') {
      return (
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30 font-semibold"
        >
          <Bookmark className="h-2.5 w-2.5 mr-0.5" />
          Booking
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold"
      >
        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
        Kosong
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-3 select-none">
      {/* Canvas Top Controls Toolbar */}
      <div className="canvas-toolbar flex flex-wrap items-center justify-between gap-2 p-2 bg-card rounded-xl border border-border/80 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(1))))}
              className="h-7 w-7 p-0 cursor-pointer"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="h-3.5 w-3.5 text-primary" />
            </Button>
            <span className="text-[11px] font-mono font-bold w-12 text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.1).toFixed(1))))}
              className="h-7 w-7 p-0 cursor-pointer"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="h-3.5 w-3.5 text-primary" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setZoom(1)}
              className="h-7 w-7 p-0 cursor-pointer text-xs"
              title="Reset Zoom 100%"
            >
              <Maximize className="h-3 w-3" />
            </Button>
          </div>

          {/* Center / Fit View Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCenterView}
            className="h-8 text-xs gap-1.5 font-bold cursor-pointer"
            title="Pusatkan denah meja di tengah layar"
          >
            <Focus className="h-3.5 w-3.5 text-primary" />
            <span>Pusatkan Denah</span>
          </Button>

          {/* Snap to Grid Toggle */}
          <Button
            type="button"
            variant={snapToGrid ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className="h-8 text-xs gap-1.5 font-semibold cursor-pointer"
          >
            <Grid className="h-3.5 w-3.5 text-primary" />
            <span>Snap Grid (20px): {snapToGrid ? 'Aktif' : 'Bebas'}</span>
          </Button>

          {/* Grid Lines Toggle */}
          <Button
            type="button"
            variant={showGrid ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            {showGrid ? 'Sembunyikan Garis' : 'Tampilkan Garis'}
          </Button>
        </div>

        {/* Legend Status Colors */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pr-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Kosong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Terisi / Ada Bill</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span>Reservasi</span>
          </div>
        </div>
      </div>

      {/* Interactive Infinite Movable Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        className={`relative flex-1 min-h-[560px] w-full overflow-hidden rounded-2xl border transition-colors select-none ${
          isPanning || isSpacePressed ? 'cursor-grabbing' : 'cursor-grab'
        } ${
          showGrid
            ? 'bg-muted/10 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)]'
            : 'bg-background'
        }`}
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      >
        {/* Dynamic Transformed Floorplan Layout Layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {tables.length === 0 ? (
            <div className="absolute left-20 top-20 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/80 rounded-2xl bg-card/60 max-w-sm pointer-events-auto">
              <Grid className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-bold text-foreground">Belum ada meja di area ini</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Klik tombol &ldquo;+ Tambah Meja&rdquo; atau &ldquo;+ Buat Meja Berurutan&rdquo; di
                atas.
              </p>
            </div>
          ) : (
            tables.map((table) => {
              const isSelected = selectedTableId === table.id;
              const isDragging = draggingTableId === table.id;

              return (
                <div
                  key={table.id}
                  onMouseDown={(e) => handleMouseDownTable(e, table)}
                  onClick={() => onSelectTable?.(table)}
                  className={`table-item-card absolute rounded-xl border flex flex-col justify-between p-2.5 transition-shadow cursor-grab active:cursor-grabbing group pointer-events-auto select-none ${
                    isDragging ? 'shadow-2xl z-30 opacity-90' : 'shadow-xs hover:shadow-md'
                  } ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-card z-20'
                      : table.status === 'OCCUPIED'
                        ? 'border-amber-500/50 bg-amber-500/10 dark:bg-amber-950/30'
                        : table.status === 'RESERVED'
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border/80 bg-card hover:border-primary/50'
                  }`}
                  style={{
                    left: `${table.x}px`,
                    top: `${table.y}px`,
                    width: `${table.width}px`,
                    height: `${table.height}px`,
                  }}
                >
                  {/* Top Bar: Table Name & Status Badge */}
                  <div className="flex items-start justify-between gap-1 w-full overflow-hidden">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-foreground truncate tracking-tight">
                        {table.name}
                      </p>
                    </div>
                    {getStatusBadge(table)}
                  </div>

                  {/* Middle Info: Capacity & Active Order preview if occupied */}
                  <div className="my-auto py-0.5">
                    {table.status === 'OCCUPIED' && table.activeOrderTotal ? (
                      <div className="text-[10px] space-y-0.5">
                        <p className="font-bold text-amber-600 dark:text-amber-400 truncate">
                          {table.currentCustomerName || 'Pelanggan'}
                        </p>
                        <p className="font-mono font-bold text-foreground">
                          {formatCurrency(table.activeOrderTotal)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Users className="h-3 w-3 text-primary shrink-0" />
                        <span className="font-medium">{table.capacity} Kursi</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Action Buttons (Only in Edit Mode) */}
                  {isEditable && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTableDetails?.(table);
                        }}
                        className="table-action-btn h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        title="Edit Rincian Meja"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTable?.(table);
                        }}
                        className="table-action-btn h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Hapus Meja"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Resize Handle on Bottom-Right Corner (Editable Only) */}
                  {isEditable && (
                    <div
                      onMouseDown={(e) => handleMouseDownResize(e, table)}
                      className="resize-handle absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-br-lg rounded-tl-sm bg-primary/70 hover:bg-primary cursor-se-resize flex items-center justify-center shadow-xs"
                      title="Tarik untuk mengubah ukuran meja"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Top-Right Floating Compass Rose (Arah Mata Angin) */}
        <div className="absolute top-3 right-3 z-20 pointer-events-auto">
          <CompassRose
            rotation={orientationDeg}
            onRotate={() => setOrientationDeg((prev) => (prev + 90) % 360)}
          />
        </div>

        {/* Bottom-Right Navigation Canvas Helper Bar */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 p-1.5 px-3 rounded-xl bg-card/90 backdrop-blur-md border border-border/80 text-[10px] text-muted-foreground shadow-xs pointer-events-none">
          <Hand className="h-3 w-3 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Tahan & geser background</strong> untuk memindahkan
            canvas • <strong className="text-foreground">Scroll</strong> untuk zoom
          </span>
        </div>
      </div>
    </div>
  );
};

export default TableCanvas;
