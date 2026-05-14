# Layout Views

Hommerized offers multiple ways to visualize your services, allowing you to choose the most efficient layout for your dashboard.

## View Modes

You can switch between three main layout modes:

### 1. Columns View (Default)
The classic Homer layout. Services are organized in responsive columns (usually 3 or 4 per row on desktop).
- **Best for**: Dashboards with a moderate number of services.
- **Features**: Large cards with clear icons and subtitles.

### 2. List View
A vertical list of services.
- **Best for**: Services with long descriptions or when you want a more compact, linear overview.
- **Features**: Full-width rows, ideal for mobile devices or sidebar-style dashboards.

### 3. Grid View
A dense, compact grid of services.
- **Best for**: Power users with dozens of services who want everything visible at a glance without much scrolling.
- **Features**: Small, square-ish cells that maximize screen real estate.

## Configuration

You can set the default layout in your `assets/config/config.yml` file:

```yaml
defaults:
  layout: columns # Options: 'columns', 'list', 'grid'
```

> [!TIP]
> You can also customize the number of columns in the standard view:
> ```yaml
> columns: 3 # Options: 1, 2, 3, 4, 6, 12
> ```

## Interactive Switching

Hommerized includes a layout switcher directly in the navigation bar. 

- **How to use**: Click the layout icon (usually next to the dark mode toggle) to cycle through the available views.
- **Persistence**: Your choice is saved in your browser's local storage, so it persists between sessions.

## Customizing Layouts

Each layout uses specific CSS classes that you can override in your `custom.css` if you want to fine-tune the spacing or alignment.

---
*Hommerized by AntKinton*
