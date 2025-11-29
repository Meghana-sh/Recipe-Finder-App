# Recipe Finder App

A modern, interactive React web app that helps users discover recipes based on available ingredients. Built with **Vite + React**, styled with **Bootstrap**, and powered by the free **TheMealDB API**.

## Features

### 🔐 Authentication
- **Login & Sign Up**: User-friendly auth page with email validation and password strength checks
- Form validation with helpful error messages
- Social login buttons (UI placeholders for Google & GitHub)

### 🍽️ Recipe Discovery
- **Dual Search**: Search by ingredient (e.g., "chicken") or dish name (e.g., "pizza")
- **Fallback Search**: Automatically searches by meal name if ingredient search returns no results
- **Recent Searches**: Dropdown suggestions of your last 8 searches (stored in localStorage)
- **Auto-Load**: Loads 6 "chicken" recipes on login for immediate exploration

### ❤️ Favorites
- **Save Recipes**: Click the heart icon on any recipe card to add/remove from favorites
- **Persistent Storage**: Favorites are saved to localStorage across sessions
- **Dedicated View**: Toggle to view only your saved recipes
- **Favorites Counter**: See how many recipes you've saved at a glance

### 📖 Recipe Details
- **Full Recipe Modal**: View complete ingredients, cooking instructions, category, and origin area
- **YouTube Links**: Watch recipe tutorials directly from the modal
- **Clean Layout**: Side-by-side image and instructions for easy reading

### ⚡ Smart Pagination
- **Load More**: Shows 6 recipes at a time; click "Load more" to see additional results
- **Seamless UX**: Prevents overwhelming the page with too many results at once

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.2 |
| **Build Tool** | Vite 5 |
| **Styling** | Bootstrap 5.3 CDN |
| **State** | React Hooks (useState, useEffect) |
| **Storage** | localStorage (favorites, recent searches) |
| **API** | TheMealDB (free, no API key required) |

## Getting Started

### Prerequisites
- **Node.js** v16+ (includes npm)

### Installation

1. **Clone the repository** (or navigate to your project folder):
```bash
cd c:\Users\Meghana SH\Desktop\finder
```

2. **Install dependencies**:
```powershell
npm install
```

3. **Start the development server**:
```powershell
npm run dev
```

4. **Open in browser**:
   - Navigate to `http://localhost:5173`
   - Login with any email/password (≥6 chars)
   - Start searching for recipes!

### Build for Production

```powershell
npm run build
npm run preview
```

## Project Structure

```
finder/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies & scripts
├── vite.config.js               # Vite configuration
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Auth routing logic
│   ├── RecipeApp.jsx            # Main recipe search/favorites app
│   ├── styles.css               # Global styles + spinner, favorites
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── AuthPage.jsx     # Login/Sign up form UI
│   │   │   └── auth.css         # Auth page styling
│   │   ├── SearchBar.jsx        # Search input + recent suggestions
│   │   ├── RecipeCard.jsx       # Recipe card with favorite button
│   │   └── RecipeModal.jsx      # Full recipe details modal
│   └── RecipeApp.jsx            # App logic (search, favorites, pagination)
└── README.md                     # This file
```

## Usage

### Search for Recipes
1. **Type an ingredient** (e.g., "chicken", "rice", "tomato") or **dish name** (e.g., "pizza", "pasta", "omelette")
2. Click **Search** or press Enter
3. Browse results; click **Load more** to see additional recipes

### Save Favorites
- Click the **♥** button on any recipe card
- Heart turns **red** when saved
- View all favorites by clicking **View Favorites** button

### View Recipe Details
- Click **View Details** on any recipe card
- See full ingredients list, step-by-step instructions, category, and area
- Watch tutorial on YouTube (if available)

### Recent Searches
- Type in the search box to see your last 8 searches
- Click any suggestion to instantly search that query

### Log Out
- Click **Log out** in the top-right corner
- Return to login page

## API Endpoints Used

All requests are to **TheMealDB** (free, no API key required):

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `/filter.php?i={ingredient}` | Search by ingredient | `filter.php?i=chicken` |
| `/search.php?s={meal}` | Search by meal name | `search.php?s=pizza` |
| `/lookup.php?i={id}` | Get full recipe details | `lookup.php?i=52772` |

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers with ES6 support

## Performance Notes

- **Lazy Loading**: Recipes load on demand (6 at a time)
- **Local Caching**: Favorites and recent searches stored in browser (localStorage)
- **Fast API**: TheMealDB serves responses in <500ms typically
- **Minimal Bundle**: Vite ensures fast production builds

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Category/Area filters
- [ ] User accounts with cloud sync
- [ ] Dietary preferences (vegetarian, vegan, gluten-free)
- [ ] Nutrition info per recipe
- [ ] Share recipes via URL
- [ ] Shopping list with quantities
- [ ] Recipe ratings & reviews

## Troubleshooting

### "No recipes found" error
- TheMealDB has limited ingredients; try common ones: chicken, beef, rice, tomato, onion
- Alternatively, search by dish name: pizza, pasta, burger, salad

### Dev server won't start
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure Node v16+ is installed: `node -v`

### Favorites not persisting
- Check that localStorage is enabled in your browser
- Clear browser cache if issues persist

### Modal not opening
- Ensure JavaScript is enabled
- Try refreshing the page

## Contributing

This is a personal learning project. Feel free to fork and customize!

## License

MIT

## Author

Built with ❤️ using React, Vite, and TheMealDB API

---

**Happy cooking! 🍳**
