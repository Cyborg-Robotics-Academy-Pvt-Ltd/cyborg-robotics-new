# Active Tabs Component Documentation

## Overview

The ActiveTabs component is a customizable tab navigation component with smooth animations and active state highlighting. It follows the same design patterns used in the header and navigation components throughout the application.

## Installation

The component is automatically available after creating the file at `src/components/ui/active-tabs.tsx`.

## Usage

### Basic Usage

```tsx
import ActiveTabs from "@/components/ui/active-tabs";

const tabs = [
  { id: "tab1", label: "Tab 1" },
  { id: "tab2", label: "Tab 2" },
  { id: "tab3", label: "Tab 3" },
];

export default function MyComponent() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <ActiveTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  );
}
```

### With Links

```tsx
const tabsWithLinks = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "contact", label: "Contact", href: "/contact" },
];

<ActiveTabs tabs={tabsWithLinks} />;
```

## Props

| Prop        | Type                                   | Default      | Description               |
| ----------- | -------------------------------------- | ------------ | ------------------------- |
| tabs        | TabItem[]                              | []           | Array of tab items        |
| activeTab   | string                                 | First tab ID | Currently active tab      |
| onTabChange | function                               | undefined    | Callback when tab changes |
| variant     | "default" \| "compact" \| "full-width" | "default"    | Visual variant            |
| orientation | "horizontal" \| "vertical"             | "horizontal" | Tab orientation           |
| className   | string                                 | ""           | Additional CSS classes    |

## TabItem Interface

```ts
interface TabItem {
  id: string;
  label: string;
  href?: string;
}
```

## Variants

### Default

Standard tab styling with medium padding.

### Compact

Smaller tabs with reduced padding, suitable for dense layouts.

### Full-width

Tabs that expand to fill the available width.

## Orientation

### Horizontal

Tabs arranged in a row (default).

### Vertical

Tabs arranged in a column.

## Integration with Header Navigation

The ActiveTabs component follows the same active state patterns used in the header navigation:

- Red background for active tabs
- Smooth transition animations
- Consistent styling with the rest of the application

## Example Implementation

See `src/app/mycomp/page.tsx` for a complete demo implementation.
