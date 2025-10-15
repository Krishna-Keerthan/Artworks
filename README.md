# 🎨 Artwork Gallery - Interactive Data Table

A modern, feature-rich React application for browsing and managing artwork data from the Art Institute of Chicago's public API. Built with PrimeReact components and TypeScript for a robust, production-ready experience.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Component Architecture](#-component-architecture)

---

## ✨ Features

### 1. **Data Fetching & Display**
- Fetches artwork data from the Art Institute of Chicago API
- Displays comprehensive artwork information:
  - Title
  - Place of Origin
  - Artist Name
  - Inscriptions
  - Date Range (Start/End)
- Real-time loading indicators during data fetch

### 2. **Advanced Pagination**
- **Lazy Loading**: Server-side pagination for optimal performance
- **Page Caching**: Previously viewed pages are cached to reduce API calls
- **Configurable Page Size**: Support for rows per page dropdown
- **Navigation Controls**: First, Previous, Next, Last page buttons
- Displays total record count and current page range

### 3. **Multi-Row Selection System**
- **Checkbox Selection**: Select individual rows via checkboxes
- **Row Click Selection**: Toggle between checkbox and row-click selection modes
- **Persistent Selection**: Selected rows remain highlighted across page navigation
- **Visual Feedback**: Blue banner displays selection count with multi-page indicator

### 4. **Intelligent Bulk Selection** ⭐
- **Cross-Page Selection**: Select N rows spanning multiple pages
- **Smart Prefetching**: Automatically fetches required pages in parallel
- **Progress Indication**: Loading spinner and "Selecting..." state during bulk operations
- **Preview Information**: Shows how many pages will be affected before selection
- **Input Validation**: Min/max constraints, disabled state during operations

**Example Use Cases:**
- Select first 20 rows → Selects 12 from Page 1 + 8 from Page 2
- Select first 50 rows → Automatically fetches and selects across 5 pages
- Cached pages load instantly, new pages fetch in parallel

### 5. **Sorting Capabilities**
- Sortable columns: Title, Start Date, End Date
- Click column headers to toggle ascending/descending order
- Server-side sorting integration ready

### 6. **User Experience Enhancements**
- **Modern UI Design**: Gradient backgrounds, rounded corners, shadow effects
- **Striped Rows**: Alternating row colors for better readability
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Spinners during data fetch and bulk operations
- **Empty State Handling**: Graceful display when no data available
- **Artist Name Formatting**: Extracts and displays primary artist name

### 7. **Error Handling**
- Try-catch blocks for all async operations
- Console error logging for debugging
- Graceful fallbacks for missing/null data
- Network failure resilience

---

## 🛠 Tech Stack

### Core Technologies
- **React 18+** - UI library with Hooks
- **TypeScript** - Type safety and better developer experience
- **PrimeReact 10+** - Enterprise-grade UI component library

### UI Components Used
- `DataTable` - Advanced table with pagination, sorting, selection
- `Column` - Table column configuration
- `InputSwitch` - Toggle for selection modes
- `Button` - Action buttons and controls
- `OverlayPanel` - Popup panel for bulk selection
- `InputNumber` - Numeric input with validation
- `ProgressSpinner` - Loading indicators

### Styling
- **PrimeReact Themes** - Lara Light Blue theme
- **PrimeIcons** - Icon library
- **PrimeFlex** - Utility CSS framework
- **Tailwind-style Classes** - Custom gradient backgrounds

### External API
- **Art Institute of Chicago API** - Public artwork database
- Base URL: `https://api.artic.edu/api/v1/artworks`

---

## 📦 Installation

### Prerequisites
```bash
Node.js >= 16.x
npm >= 8.x or yarn >= 1.22.x
```

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd artwork-gallery
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Required packages**
```bash
npm install react react-dom
npm install primereact primeicons primeflex
npm install typescript @types/react @types/react-dom
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

5. **Build for production**
```bash
npm run build
# or
yarn build
```

---

## 🚀 Usage

### Basic Navigation
1. **Browse Artworks**: Scroll through paginated artwork data
2. **Change Pages**: Use pagination controls at bottom of table
3. **Sort Data**: Click column headers to sort (Title, Start Date, End Date)

### Selection Modes

#### Manual Selection
1. Disable "Row Click Selection" toggle
2. Click checkboxes to select individual rows
3. Selected count displays in blue banner above table

#### Row Click Selection
1. Enable "Row Click Selection" toggle
2. Click anywhere on a row to select/deselect
3. Faster selection for quick operations

### Bulk Selection Feature

#### Select Within Current Page
1. Click "Select Rows" button in table header
2. Enter number (1-12 for single page)
3. Click "Select" button
4. First N rows on current page are selected

#### Cross-Page Selection
1. Click "Select Rows" button
2. Enter number greater than 12 (e.g., 25)
3. Preview shows: "Will select across 3 pages"
4. Click "Select" button
5. System automatically:
   - Fetches required pages (if not cached)
   - Shows "Selecting..." spinner
   - Selects 25 rows across pages 1, 2, and 3
6. Navigate to other pages to see continued selection

#### Tips
- **Maximum Selection**: Limited to total records in database
- **Performance**: Cached pages select instantly
- **Visual Feedback**: Blue banner shows selection status
- **Cancellation**: Close overlay panel to cancel operation

---

## 🔌 API Reference

### Endpoint
```
GET https://api.artic.edu/api/v1/artworks
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 12 | Items per page |

### Response Structure
```typescript
{
  data: [
    {
      id: string,
      title: string,
      place_of_origin: string,
      artist_display: string,
      inscriptions: string | null,
      date_start: number | null,
      date_end: number | null
    }
  ],
  pagination: {
    total: number,
    limit: number,
    offset: number,
    current_page: number
  }
}
```

---

## 🏗 Component Architecture

### State Management
```typescript
// Data States
const [artworks, setArtworks] = useState<Artworks[]>([])
const [selectedArtworks, setSelectedArtworks] = useState<Artworks[]>([])
const [pageCache, setPageCache] = useState<Record<number, Artworks[]>>({})

// UI States
const [loading, setLoading] = useState<boolean>(true)
const [isSelecting, setIsSelecting] = useState<boolean>(false)
const [rowClick, setRowClick] = useState<boolean>(true)

// Pagination States
const [first, setFirst] = useState<number>(0)
const [rows, setRows] = useState<number>(12)
const [totalRecords, setTotalRecords] = useState<number>(0)

// Selection States
const [selectCount, setSelectCount] = useState<number | null>(null)
```

### Key Functions

#### `fetchArtworks(page, pageSize)`
- Fetches artwork data for a specific page
- Implements caching to avoid redundant API calls
- Updates total records count
- Handles loading states

#### `prefetchPages(pageNumbers)`
- Fetches multiple pages in parallel using `Promise.all()`
- Skips already-cached pages
- Returns fetched data immediately for use
- Updates cache after all fetches complete

#### `calculatePagesNeeded(count, currentPage)`
- Calculates which pages are needed for bulk selection
- Returns array of page numbers
- Accounts for rows-per-page configuration

#### `handleAutoSelect()`
- Orchestrates cross-page bulk selection
- Prefetches required pages
- Collects selected artworks from cache
- Updates selection state
- Manages loading indicators

#### `onPage(event)`
- Handles pagination events
- Updates current page state
- Triggers data fetch for new page

#### `onSelectionChange(event)`
- Handles checkbox/row-click selection changes
- Updates selected artworks state



---

**Built with ❤️ using React + PrimeReact + TypeScript**
