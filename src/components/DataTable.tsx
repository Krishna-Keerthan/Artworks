import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import type {
  DataTableSelectionMultipleChangeEvent,
  DataTablePageEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import type { InputSwitchChangeEvent } from "primereact/inputswitch";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

interface Artworks {
  id?: string;
  title?: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string | null;
  date_start?: number | null;
  date_end?: number | null;
}

export default function ArtworkTable() {
  const [artworks, setArtworks] = useState<Artworks[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artworks[]>([]);
  const [rowClick, setRowClick] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(12);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pageCache, setPageCache] = useState<Record<number, Artworks[]>>({});
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const op = useRef<OverlayPanel>(null);
  const [selectCount, setSelectCount] = useState<number | null>(null);

  const fetchArtworks = async (page: number = 1, pageSize: number = 12) => {
    if (pageCache[page]) {
      setArtworks(pageCache[page]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${pageSize}`
      );
      const data = await response.json();

      const mappedData: Artworks[] = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));

      setPageCache((prev) => ({ ...prev, [page]: mappedData }));
      setArtworks(mappedData);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const prefetchPages = async (pageNumbers: number[]): Promise<Record<number, Artworks[]>> => {
    const newCache: Record<number, Artworks[]> = {};
    
    const fetchPromises = pageNumbers.map(async (pageNum) => {
      if (pageCache[pageNum]) {
        newCache[pageNum] = pageCache[pageNum];
        return;
      }
      
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${pageNum}&limit=${rows}`
        );
        const data = await response.json();
        
        const mappedData: Artworks[] = data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          place_of_origin: item.place_of_origin,
          artist_display: item.artist_display,
          inscriptions: item.inscriptions,
          date_start: item.date_start,
          date_end: item.date_end,
        }));
        
        newCache[pageNum] = mappedData;
      } catch (error) {
        console.error(`Error prefetching page ${pageNum}:`, error);
      }
    });
    
    await Promise.all(fetchPromises);
    
    setPageCache((prev) => ({ ...prev, ...newCache }));
    
    return newCache;
  };

  useEffect(() => {
    fetchArtworks(1, 12);
  }, []);

  const onPage = (event: DataTablePageEvent) => {
    const nextPage = (event.page ?? 0) + 1;
    setFirst(event.first ?? 0);
    setRows(event.rows ?? 12);
    fetchArtworks(nextPage, event.rows ?? 12);
  };

  const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artworks[]>) => {
    setSelectedArtworks(e.value || []);
  };

  const calculatePagesNeeded = (count: number, currentPage: number): number[] => {
    const pages: number[] = [];
    let remaining = count;
    let page = currentPage;
    
    while (remaining > 0) {
      pages.push(page);
      remaining -= rows;
      page++;
    }
    
    return pages;
  };

  const handleAutoSelect = async () => {
    if (!selectCount || selectCount <= 0) return;
    
    setIsSelecting(true);
    
    try {
      const currentPage = Math.floor(first / rows) + 1;
      const pagesToFetch = calculatePagesNeeded(selectCount, currentPage);
      
      const fetchedData = await prefetchPages(pagesToFetch);
      
      const selected: Artworks[] = [];
      let remaining = selectCount;
      
      for (const pageNum of pagesToFetch) {
        const pageData = fetchedData[pageNum] || pageCache[pageNum] || [];
        const toTake = Math.min(remaining, pageData.length);
        selected.push(...pageData.slice(0, toTake));
        remaining -= toTake;
        
        if (remaining <= 0) break;
      }
      
      setSelectedArtworks(selected);
      op.current?.hide();
    } catch (error) {
      console.error("Error in bulk selection:", error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="card shadow-2 p-6 rounded-2xl bg-white max-w-7xl mx-auto">
        <h2 className="text-center text-2xl font-semibold text-blue-600 mb-6">
          🎨 Artworks Gallery
        </h2>

        <div className="flex justify-center items-center mb-4 gap-3">
          <InputSwitch
            inputId="input-rowclick"
            checked={rowClick}
            onChange={(e: InputSwitchChangeEvent) => setRowClick(e.value!)}
          />
          <label htmlFor="input-rowclick" className="text-gray-700 font-medium">
            Row Click Selection
          </label>
        </div>

        {selectedArtworks.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <i className="pi pi-check-circle mr-2"></i>
              <strong>{selectedArtworks.length}</strong> rows selected
              {selectedArtworks.length > artworks.length && (
                <span className="ml-2 text-blue-500">
                  (across multiple pages)
                </span>
              )}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center my-10">
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={artworks}
            dataKey="id"
            selectionMode={rowClick ? null : "multiple"}
            selection={selectedArtworks}
            onSelectionChange={onSelectionChange}
            paginator
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            onPage={onPage}
            lazy
            loading={loading}
            tableStyle={{ minWidth: "70rem" }}
            className="shadow-lg rounded-xl overflow-hidden"
            stripedRows
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>

            <Column
              header={
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    icon="pi pi-cog"
                    label="Select Rows"
                    className="p-button-sm p-button-outlined p-button-primary"
                    onClick={(e) => op.current?.toggle(e)}
                  />
                  <OverlayPanel ref={op}>
                    <div className="p-3 w-64">
                      <h4 className="text-blue-600 mb-3 text-sm font-semibold">
                        Auto Select Rows
                      </h4>
                      <InputNumber
                        value={selectCount}
                        onValueChange={(e) => setSelectCount(e.value ?? null)}
                        min={1}
                        max={totalRecords}
                        placeholder="Enter number of rows"
                        className="w-full mb-3"
                        disabled={isSelecting}
                      />
                      <Button
                        label={isSelecting ? "Selecting..." : "Select"}
                        icon={isSelecting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                        onClick={handleAutoSelect}
                        className="w-full p-button-sm"
                        disabled={isSelecting}
                      />
                      {selectCount && selectCount > rows && (
                        <p className="text-xs text-gray-500 mt-2">
                          Will select across {Math.ceil(selectCount / rows)} pages
                        </p>
                      )}
                    </div>
                  </OverlayPanel>
                </div>
              }
              body={() => null}
              style={{ width: "15%" }}
            />

            <Column field="title" header="Title" sortable style={{ width: "20%" }}></Column>

            <Column
              field="place_of_origin"
              header="Place of Origin"
              style={{ width: "15%" }}
            ></Column>

            <Column
              field="artist_display"
              header="Artist"
              style={{ width: "25%" }}
              body={(row) => (
                <span className="text-gray-700">
                  {row.artist_display?.split("\n")[0] ?? "Unknown"}
                </span>
              )}
            ></Column>

            <Column
              field="inscriptions"
              header="Inscriptions"
              style={{ width: "20%" }}
              body={(row) => row.inscriptions ?? "-"}
            ></Column>

            <Column
              field="date_start"
              header="Start"
              sortable
              style={{ width: "10%" }}
            ></Column>

            <Column
              field="date_end"
              header="End"
              sortable
              style={{ width: "10%" }}
            ></Column>
          </DataTable>
        )}
      </div>
    </div>
  );
}