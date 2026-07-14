// 100 000 rows, ~20 in the DOM. Rows are fixed-height, absolutely
// positioned, and render(item, reuse) UPDATES the existing element while
// scrolling instead of rebuilding it — DOM churn stays flat. The scroll
// container is resolved on first reconcile AFTER mount, so a list built
// detached calls refresh() once inserted — onMount is the right moment.
import { onMount } from "loom/dom";
import { virtualList } from "loom/dom/virtual-list";

interface Row {
  readonly id: number;
  readonly label: string;
}

const rows: Row[] = Array.from({ length: 100_000 }, (_, i) => ({
  id: i,
  label: `Row ${i.toLocaleString()}`,
}));

const vlist = virtualList<Row>({
  rowHeight: 24,
  key: (row) => row.id,
  render: (row, reuse) => {
    const el = reuse ?? ((<div class="vrow" />) as HTMLElement);
    el.textContent = `${row.label} — ${row.id % 2 ? "odd" : "even"}`;
    return el;
  },
});
vlist.setItems(rows);
onMount(vlist.el, () => vlist.refresh());

export default (
  <div class="col">
    <div class="row">
      <button type="button" onclick={() => vlist.scrollToIndex(0)}>
        top
      </button>
      <button type="button" onclick={() => vlist.scrollToIndex(50_000)}>
        row 50 000
      </button>
      <button type="button" onclick={() => vlist.scrollToEnd()}>
        end
      </button>
    </div>
    <div class="scroller" style="height: 280px; overflow-y: auto; width: 320px">
      {vlist.el}
    </div>
  </div>
);
