import { useEffect, useState } from "react";
import { DataTable} from "primereact/datatable";
import type { DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

type Artwork = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
};

export default function TableData() {
  const [items, setItems] = useState<Artwork[]>([]);
  const [selectedItems, setSelectedItems] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(12);

  const [showInput, setShowInput] = useState<boolean>(false);
  const [selectCount, setSelectCount] = useState<string>("");

  const fetchData = (page: number) => {
    setLoading(true);
    fetch(`https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=${rows}`)
      .then((res) => res.json())
      .then((json) => {
        setItems(json.data);
        setTotalRecords(json.pagination.total);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  // ✅ Use DataTableStateEvent type
  const onPageChange = (e: DataTableStateEvent) => {
    setFirst(e.first ?? 0);
    setRows(e.rows ?? 12);
    fetchData(e.page ?? 0);
  };

  const handleSelectChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0;
    setSelectCount(e.target.value);

    if (count <= 0) {
      setSelectedItems([]);
      return;
    }

    let selected: Artwork[] = [];
    const pagesNeeded = Math.ceil(count / rows);

    for (let i = 0; i < pagesNeeded; i++) {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${i + 1}&limit=${rows}`
      );
      const data = await res.json();
      selected = [...selected, ...data.data];
    }

    setSelectedItems(selected.slice(0, count));
  };

  const customHeader = () => (
    <div style={{ position: "relative" }}>
      <Button
        icon="pi pi-chevron-down"
        rounded
        text
        onClick={() => setShowInput((prev) => !prev)}
        style={{ border: "1px solid #ccc" }}
      />

      {showInput && (
        <div
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "0",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
        >
          <label style={{ fontSize: "0.9rem", marginRight: "5px" }}>Select first</label>
          <input
            type="number"
            min={1}
            max={totalRecords}
            value={selectCount}
            onChange={handleSelectChange}
            placeholder="Enter number"
            style={{
              padding: "4px 6px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              width: "80px",
            }}
          />
          <span style={{ marginLeft: "5px" }}>rows</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="card" style={{ padding: "1rem" }}>
    <h1 style={{ display: "flex" , justifyContent:"center" }}>🎨 Artworks Table 🎨</h1>


      <DataTable
        value={items}
        paginator
        lazy
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPageChange} // ✅ correctly typed
        stripedRows
        responsiveLayout="scroll"
        selectionMode="multiple"
        selection={selectedItems}
        onSelectionChange={(e) => setSelectedItems(e.value)}
      >
        <Column
          selectionMode="multiple"
          header={customHeader()}
          headerStyle={{ width: "2.5rem" }}
        />
        <Column field="title" header="Title" sortable />
        <Column field="place_of_origin" header="Place of Origin" sortable />
        <Column field="artist_display" header="Artist" sortable />
        <Column field="inscriptions" header="Inscriptions" sortable />
        <Column field="date_start" header="Start Date" sortable />
        <Column field="date_end" header="End Date" sortable />
      </DataTable>
    </div>
  );
}
