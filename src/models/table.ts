export interface Header<TItem> {
  key: keyof TItem;
  label: string;
  sortable?: boolean;
}

export type HeaderGroup<TItem, THeader extends Header<TItem> = Header<TItem>> = {
  link?: string;
  children: THeader[];
};

export interface Table<TItem> {
  headers: HeaderGroup<TItem>[];
  items: TItem[];
}
