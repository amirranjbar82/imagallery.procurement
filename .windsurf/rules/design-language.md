---
trigger: model_decision
description: when creating UI elements and page, follow these rules.
---

🎨 UI Design Language Rules
Based on the consistent styling we've applied across the supplier management system, here are the UI rules to follow throughout the application:

📦 Card Containers
Background: bg-white
Border: rounded-lg shadow-sm border border-gray-200
Padding: p-4 
Spacing: space-y-4 between major sections
🏷️ Typography
Page Titles: text-2xl font-bold text-gray-900
Section Headers: text-lg font-semibold text-gray-900 mb-4
Descriptions: text-gray-600 mt-1
Labels: text-sm font-medium (for form labels)
Helper Text: text-sm text-gray-600
🔘 Buttons
Primary: bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800
Secondary: px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50
Loading State: Include spinner with animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2
📊 Stats Cards
Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
Card Style: Same as card containers (bg-white rounded-lg shadow-sm border border-gray-200 p-4)
Icons: h-5 w-5 with color coding (blue, green, yellow, purple)
Values: text-2xl font-bold text-gray-900 mt-2
Labels: text-sm font-medium text-gray-600
📱 Responsive Grid
Desktop: lg:grid-cols-4 (4 columns)
Tablet: md:grid-cols-2 (2 columns)
Mobile: grid-cols-1 (1 column)
Gap: gap-4
⚠️ State Indicators
Loading: White card with centered spinner (border-b-2 border-slate-900)
Error: White card with red accents (border-red-200, text-red-600)
Success: Use green color variants
Warning: Use yellow color variants
🎯 Screen Width
Container: No max-width restriction, full responsive Left aligned.
Content: Naturally flows within parent containers
Forms: Use responsive grids (md:grid-cols-2, md:grid-cols-3)
🔄 Interactive Elements
Hover States: Always include hover effects
Disabled States: disabled:opacity-50
Focus States: Rely on default focus-visible styles
Transitions: Use default browser transitions (no custom animations)