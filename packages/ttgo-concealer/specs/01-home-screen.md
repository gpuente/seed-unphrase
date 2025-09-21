# Home Screen Specification

## Overview
The home screen is the first interface users see when powering on the TTGO T-Display device. It provides the main menu for selecting between the two primary functions: **CONCEAL** and **REVEAL** seed phrases. This screen establishes the device's purpose and guides users toward their desired operation.

## Display Layout (135x240 pixels)

### ASCII Visual Design
```
┌─────────────────────────────────────────────┐ ← 135px width
│                                             │
│           🌱 SEED CONCEALER                 │ ← Title/Logo
│              v1.0.0                         │ ← Version
│                                             │
│ ─────────────────────────────────────────── │ ← Separator line
│                                             │
│                                             │
│        ┌─────────────────────┐              │
│        │  🔒 CONCEAL PHRASE  │              │ ← Option 1 (selected)
│        │                     │              │
│        │   Hide your seed    │              │
│        │   phrase securely   │              │
│        └─────────────────────┘              │
│                                             │
│        ┌─────────────────────┐              │
│        │  🔓 REVEAL PHRASE   │              │ ← Option 2
│        │                     │              │
│        │   Recover hidden    │              │
│        │   seed phrase       │              │
│        └─────────────────────┘              │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │ ← 240px height
│ ─────────────────────────────────────────── │
│                                             │
│  [◄] Navigate      [►] Navigate             │ ← Navigation help
│         [◄+►] Select Option                 │
│                                             │
└─────────────────────────────────────────────┘
```

## UI Elements Breakdown

### 1. Header Section (Top 60px)
- **Title**: "🌱 SEED CONCEALER" (centered, large font)
- **Version**: "v1.0.0" (centered, small font, below title)
- **Styling**: Bold title with gradient or highlight color
- **Purpose**: Brand identity and firmware version information

### 2. Separator Line (1px)
- **Visual**: Horizontal line separating header from main content
- **Color**: Subtle border color
- **Purpose**: Visual organization and professional appearance

### 3. Main Menu Area (140px height)
Two main option cards with the following structure:

#### Option 1: CONCEAL PHRASE
- **Position**: Top card, initially selected
- **Icon**: 🔒 (lock symbol)
- **Title**: "CONCEAL PHRASE" (bold)
- **Description**: "Hide your seed phrase securely" (smaller text)
- **Selection State**: Highlighted border/background when selected
- **Dimensions**: ~200x60px card

#### Option 2: REVEAL PHRASE
- **Position**: Bottom card
- **Icon**: 🔓 (unlock symbol) 
- **Title**: "REVEAL PHRASE" (bold)
- **Description**: "Recover hidden seed phrase" (smaller text)
- **Selection State**: Standard appearance when not selected
- **Dimensions**: ~200x60px card

### 4. Footer Section (Bottom 40px)
- **Navigation Guide**: Button instruction text
- **Layout**: 
  - Line 1: "[◄] Navigate      [►] Navigate" (left-right navigation)
  - Line 2: "[◄+►] Select Option" (confirmation action)
- **Styling**: Small font, centered, instructional color

## Navigation Logic

### Button Behaviors
- **Single Button 1 (LEFT)**: Move selection up (REVEAL → CONCEAL)
- **Single Button 2 (RIGHT)**: Move selection down (CONCEAL → REVEAL)
- **Both Buttons**: Confirm selection and proceed to selected mode
- **Both Buttons Long Press**: Power off/sleep mode (if implemented)

### Selection States
- **Default Selection**: CONCEAL PHRASE (top option)
- **Visual Feedback**: Selected option has:
  - Highlighted border (thicker, colored)
  - Different background color/gradient
  - Slightly bolder text
- **Wrap-around**: Navigation wraps (REVEAL → CONCEAL → REVEAL)

### Transitions
- **To Conceal Mode**: Both buttons pressed on CONCEAL → Navigate to word count selection screen
- **To Reveal Mode**: Both buttons pressed on REVEAL → Navigate to reveal input screen
- **Visual Animation**: Smooth highlight transition between options (if performance allows)

## Visual Styling

### Color Scheme
- **Background**: Dark theme (black or dark blue)
- **Text**: White or light gray for readability
- **Title**: Accent color (purple/blue gradient)
- **Selected Option**: Highlighted border (blue/purple)
- **Unselected Option**: Subtle border (gray)
- **Icons**: Match text color with slight emphasis

### Typography
- **Title Font**: Bold, 18-20px equivalent
- **Version**: Regular, 10px equivalent
- **Option Title**: Bold, 14px equivalent
- **Option Description**: Regular, 11px equivalent
- **Footer Guide**: Regular, 9px equivalent

### Layout Properties
- **Margins**: 10-15px from screen edges
- **Card Spacing**: 20px between option cards
- **Card Padding**: 10px internal padding
- **Text Alignment**: Centered for title/version, left-aligned in cards

## State Management

### Initial State
- **Default Selection**: CONCEAL PHRASE (index 0)
- **Display State**: Show home screen with proper highlighting
- **Memory**: No persistent state - always starts with CONCEAL selected

### Selection Tracking
- **Current Index**: Integer (0 = CONCEAL, 1 = REVEAL)
- **Update Mechanism**: Button press updates index with bounds checking
- **Visual Update**: Immediate redraw of selection highlighting

## Technical Implementation Notes

### Display Rendering
- **Screen Resolution**: 135x240 pixels (portrait orientation)
- **Driver**: ST7789 TFT controller via TFT_eSPI library
- **Color Depth**: 16-bit RGB565 format
- **Refresh**: Partial screen updates for selection changes

### Performance Considerations
- **Boot Time**: Screen should appear within 2-3 seconds of power-on
- **Response Time**: Selection changes should be instantaneous (<50ms)
- **Memory Usage**: Minimal RAM footprint for display buffer
- **Power**: Optimize display brightness for battery life

### Button Integration
- **Hardware Debouncing**: TTGO built-in button debouncing
- **Software Debouncing**: Additional 50ms debounce in firmware
- **Interrupt-Driven**: Button events trigger immediate screen updates
- **Long Press Detection**: Timer-based detection for long press actions

### Code Structure
```cpp
// Pseudo-code structure
class HomeScreen {
    private:
        int selectedIndex = 0;  // 0=CONCEAL, 1=REVEAL
        
    public:
        void display();
        void handleButton1();     // Navigate up/left
        void handleButton2();     // Navigate down/right
        void handleBothButtons(); // Confirm selection
        void updateSelection();   // Redraw with current selection
};
```

## Accessibility & Usability

### Visual Clarity
- **High Contrast**: Ensure text/background contrast meets readability standards
- **Font Size**: Large enough for clear reading in various lighting
- **Icon Recognition**: Universal symbols (lock/unlock) for intuitive understanding

### Navigation Simplicity
- **Minimal Options**: Only two choices reduces cognitive load
- **Clear Instructions**: Footer guidance eliminates confusion
- **Consistent Behavior**: Matches established hardware wallet patterns

### Error Prevention
- **No Invalid States**: All navigation leads to valid screens
- **Clear Feedback**: Visual confirmation of current selection
- **Reversible Actions**: Can always navigate back from subsequent screens

## Testing Requirements

### Functional Testing
- [ ] Both menu options selectable via button navigation
- [ ] Selection wraps correctly (REVEAL → CONCEAL → REVEAL)
- [ ] Both-button press navigates to correct subsequent screen
- [ ] Screen displays properly on device power-on
- [ ] All text and icons render clearly at target resolution

### Visual Testing
- [ ] Text legible in various lighting conditions
- [ ] Selection highlighting clearly visible
- [ ] No text truncation or layout issues
- [ ] Consistent spacing and alignment
- [ ] Color scheme appropriate for target audience

### Performance Testing
- [ ] Screen renders within 3 seconds of power-on
- [ ] Button response time under 50ms
- [ ] No visual glitches during selection changes
- [ ] Memory usage within acceptable limits
- [ ] Power consumption optimized for battery operation

## Dependencies

### Hardware
- TTGO T-Display ESP32 board
- ST7789 135x240 TFT display
- Two built-in tactile buttons

### Software Libraries
- TFT_eSPI for display control
- Arduino/ESP32 button interrupt libraries
- Font rendering libraries for text display

### Assets
- Unicode emoji support (🌱🔒🔓) or custom icon sprites
- Font files for various text sizes
- Color palette definitions