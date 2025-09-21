# Navigation System Specification

## Overview
The custom navigation system provides a lightweight, reusable framework for managing screen transitions and user interactions across all TTGO device screens. It's specifically designed for 2-button hardware wallet UX patterns, eliminating the need for external menu libraries while maintaining full control over memory usage and performance.

## Design Principles

### 1. **Lightweight Architecture**
- Minimal memory footprint (~2-3KB total)
- No external dependencies beyond TFT_eSPI
- Single NavigationManager handles all screens
- Optimized for ESP32 constraints

### 2. **Reusable Components**
- Abstract Screen base class for consistent interface
- Common navigation patterns across all screens
- Shared button handling and state management
- Standardized screen transition system

### 3. **Screen-Specific Flexibility**
- Each screen defines its own context menu
- Custom handling for screen-specific actions
- Flexible content rendering per screen type
- Home screen exception (no context menu)

## Core Architecture

### NavigationManager Class
Central controller managing all navigation and screen transitions.

```cpp
class NavigationManager {
private:
    Screen* currentScreen;
    Screen* screens[MAX_SCREENS];
    bool buttonStates[2];
    unsigned long buttonPressTime[2];
    unsigned long lastDebounceTime[2];
    
public:
    NavigationManager();
    void init();
    void update();
    void handleButton1Press();
    void handleButton2Press();
    void handleBothButtonsPress();
    void handleBothButtonsLongPress();
    void navigateToScreen(ScreenType screenType);
    void showContextMenu();
    void hideContextMenu();
    Screen* getCurrentScreen();
};
```

### Screen Base Class
Abstract interface that all screens must implement.

```cpp
class Screen {
protected:
    TFT_eSPI* tft;
    NavigationManager* nav;
    bool contextMenuVisible;
    std::vector<MenuItem> contextMenu;
    int selectedContextItem;
    
public:
    Screen(TFT_eSPI* display, NavigationManager* navigation);
    virtual ~Screen();
    
    // Pure virtual methods - must be implemented by each screen
    virtual void render() = 0;
    virtual void onNavigateLeft() = 0;
    virtual void onNavigateRight() = 0; 
    virtual void onSelect() = 0;
    virtual void onEnter() = 0;  // Called when screen becomes active
    virtual void onExit() = 0;   // Called when leaving screen
    
    // Context menu methods
    virtual void setupContextMenu() = 0;
    virtual void onContextMenuSelect(int itemIndex) = 0;
    
    // Common functionality
    void showContextMenu();
    void hideContextMenu();
    void renderContextMenu();
    bool hasContextMenu();
    void updateDisplay();
};
```

## Button Event System

### Button Actions
The system recognizes three distinct button interaction patterns:

```cpp
enum ButtonAction {
    NAVIGATE_LEFT,    // Single Button 1 press
    NAVIGATE_RIGHT,   // Single Button 2 press  
    SELECT,          // Both buttons pressed simultaneously
    CONTEXT_MENU     // Both buttons long press (>1 second)
};
```

### Button Handling Flow
```
1. Hardware interrupt → Button debouncing (50ms)
2. Determine action type based on button combination
3. Delegate to current screen's appropriate handler
4. Screen updates its state and triggers display refresh
```

### Debouncing Implementation
```cpp
#define DEBOUNCE_DELAY 50
#define LONG_PRESS_DELAY 1000

bool NavigationManager::isButtonPressed(int button) {
    bool reading = digitalRead(buttonPins[button]);
    
    if (reading != buttonStates[button]) {
        lastDebounceTime[button] = millis();
    }
    
    if ((millis() - lastDebounceTime[button]) > DEBOUNCE_DELAY) {
        if (reading != buttonStates[button]) {
            buttonStates[button] = reading;
            return reading == LOW; // Active low
        }
    }
    
    return false;
}
```

## Screen Types and Navigation Flow

### Screen Enumeration
```cpp
enum ScreenType {
    HOME_SCREEN,           // Main menu (CONCEAL/REVEAL)
    WORD_COUNT_SCREEN,     // Select number of words (1-24)
    WORD_INPUT_SCREEN,     // BIP39 word entry with prediction
    CIPHER_INPUT_SCREEN,   // Cipher key entry  
    SALT_INPUT_SCREEN,     // Salt entry (optional)
    RESULT_SCREEN,         // Display concealed/revealed result
    REVEAL_INPUT_SCREEN    // Enter concealed value for reveal
};
```

### Navigation State Machine
```cpp
class NavigationStateMachine {
private:
    ScreenType currentScreenType;
    ScreenType previousScreenType;
    std::stack<ScreenType> navigationHistory;
    
public:
    void pushScreen(ScreenType screen);
    void popScreen();
    void replaceScreen(ScreenType screen);
    void clearHistory();
    ScreenType getCurrentScreen();
    ScreenType getPreviousScreen();
    bool canGoBack();
};
```

## Context Menu System

### Menu Item Structure
```cpp
struct MenuItem {
    String label;           // Display text
    int icon;              // Optional icon ID
    bool enabled;          // Is item selectable
    std::function<void()> action;  // Callback function
};
```

### Context Menu Implementation
Each screen (except home) can define its own context menu:

```cpp
// Example: Word Input Screen Context Menu
void WordInputScreen::setupContextMenu() {
    contextMenu.clear();
    contextMenu.push_back({
        .label = "Back to Home",
        .icon = ICON_HOME,
        .enabled = true,
        .action = [this]() { nav->navigateToScreen(HOME_SCREEN); }
    });
    contextMenu.push_back({
        .label = "Previous Word", 
        .icon = ICON_BACK,
        .enabled = currentWordIndex > 0,
        .action = [this]() { goToPreviousWord(); }
    });
    contextMenu.push_back({
        .label = "Cancel Entry",
        .icon = ICON_CANCEL, 
        .enabled = true,
        .action = [this]() { cancelCurrentEntry(); }
    });
}
```

### Context Menu Rendering
```cpp
void Screen::renderContextMenu() {
    if (!contextMenuVisible) return;
    
    // Semi-transparent overlay
    tft->fillRect(0, 60, 135, 120, TFT_BLACK);
    tft->drawRect(5, 65, 125, 110, TFT_WHITE);
    
    // Menu title
    tft->setTextColor(TFT_WHITE);
    tft->drawCentreString("Menu", 67, 75, 2);
    
    // Menu items
    for (int i = 0; i < contextMenu.size(); i++) {
        int y = 95 + (i * 20);
        bool selected = (i == selectedContextItem);
        
        if (selected) {
            tft->fillRect(10, y-2, 115, 18, TFT_BLUE);
        }
        
        uint16_t color = contextMenu[i].enabled ? TFT_WHITE : TFT_DARKGREY;
        tft->setTextColor(color);
        tft->drawString(contextMenu[i].label, 15, y, 1);
    }
}
```

## Memory Management

### Memory Optimization Strategies
1. **Single Screen Instance**: Only one screen active at a time
2. **Shared Resources**: Common TFT_eSPI instance across all screens
3. **Stack-based Navigation**: Minimal memory for navigation history
4. **On-Demand Context Menus**: Created when needed, destroyed when hidden

### Memory Footprint Estimation
```cpp
// NavigationManager: ~200 bytes
// Screen base class: ~150 bytes per screen
// Context menu: ~50 bytes + (items * 30 bytes)
// Navigation history: ~20 bytes + (depth * 4 bytes)
// Total estimated: ~2-3KB maximum
```

## Screen Implementation Examples

### Home Screen (No Context Menu)
```cpp
class HomeScreen : public Screen {
private:
    int selectedOption; // 0=CONCEAL, 1=REVEAL
    
public:
    void setupContextMenu() override {
        // Home screen has no context menu
        contextMenu.clear();
    }
    
    void onNavigateLeft() override {
        selectedOption = (selectedOption == 0) ? 1 : 0;
        render();
    }
    
    void onNavigateRight() override { 
        selectedOption = (selectedOption == 1) ? 0 : 1;
        render();
    }
    
    void onSelect() override {
        if (selectedOption == 0) {
            nav->navigateToScreen(WORD_COUNT_SCREEN);
        } else {
            nav->navigateToScreen(REVEAL_INPUT_SCREEN);
        }
    }
    
    void onContextMenuSelect(int itemIndex) override {
        // Not applicable for home screen
    }
};
```

### Word Count Selection Screen
```cpp
class WordCountScreen : public Screen {
private:
    int selectedCount; // 1-24
    
public:
    void setupContextMenu() override {
        contextMenu.clear();
        contextMenu.push_back({
            .label = "Back to Home",
            .action = [this]() { nav->navigateToScreen(HOME_SCREEN); }
        });
        contextMenu.push_back({
            .label = "Quick Select 12",
            .action = [this]() { selectedCount = 12; render(); }
        });
        contextMenu.push_back({
            .label = "Quick Select 24", 
            .action = [this]() { selectedCount = 24; render(); }
        });
    }
    
    void onNavigateLeft() override {
        selectedCount = (selectedCount > 1) ? selectedCount - 1 : 24;
        render();
    }
    
    void onNavigateRight() override {
        selectedCount = (selectedCount < 24) ? selectedCount + 1 : 1; 
        render();
    }
    
    void onSelect() override {
        // Store selected count and proceed to word input
        WordInputScreen::setTotalWords(selectedCount);
        nav->navigateToScreen(WORD_INPUT_SCREEN);
    }
};
```

## Display Integration

### TFT_eSPI Integration
```cpp
class DisplayManager {
private:
    TFT_eSPI tft;
    TFT_eSprite* sprite;
    
public:
    void init() {
        tft.init();
        tft.setRotation(0); // Portrait mode
        tft.fillScreen(TFT_BLACK);
        
        // Create sprite for flicker-free updates
        sprite = new TFT_eSprite(&tft);
        sprite->createSprite(135, 240);
    }
    
    void render(Screen* screen) {
        sprite->fillSprite(TFT_BLACK);
        screen->render();
        sprite->pushSprite(0, 0);
    }
};
```

### Animation Support (Optional)
```cpp
class AnimationManager {
public:
    void slideTransition(Screen* from, Screen* to, Direction dir);
    void fadeTransition(Screen* from, Screen* to);
    void highlightSelection(int x, int y, int width, int height);
};
```

## Error Handling

### Navigation Error Recovery
```cpp
class NavigationError {
public:
    enum Type {
        INVALID_SCREEN_TRANSITION,
        MEMORY_ALLOCATION_FAILED,
        DISPLAY_RENDER_ERROR
    };
    
    static void handle(Type error, const String& context) {
        // Log error and attempt recovery
        Serial.println("Navigation Error: " + String((int)error));
        
        switch (error) {
            case INVALID_SCREEN_TRANSITION:
                // Return to home screen
                NavigationManager::getInstance()->navigateToScreen(HOME_SCREEN);
                break;
                
            case MEMORY_ALLOCATION_FAILED:
                // Clear caches and retry
                clearDisplayCache();
                break;
                
            case DISPLAY_RENDER_ERROR:
                // Reinitialize display
                DisplayManager::getInstance()->reinit();
                break;
        }
    }
};
```

## Testing Strategy

### Unit Tests
```cpp
// Test button debouncing
void testButtonDebouncing() {
    NavigationManager nav;
    // Simulate rapid button presses
    // Verify only debounced events are processed
}

// Test screen transitions
void testScreenTransitions() {
    NavigationManager nav;
    nav.navigateToScreen(HOME_SCREEN);
    assert(nav.getCurrentScreen()->getType() == HOME_SCREEN);
    
    nav.navigateToScreen(WORD_COUNT_SCREEN);
    assert(nav.getCurrentScreen()->getType() == WORD_COUNT_SCREEN);
}

// Test context menu functionality
void testContextMenu() {
    WordCountScreen screen;
    screen.setupContextMenu();
    assert(screen.hasContextMenu() == true);
    assert(screen.getContextMenu().size() == 3);
}
```

### Integration Tests
- Full navigation flow testing
- Memory leak detection during screen transitions
- Display rendering performance testing
- Button response time measurement

## Performance Metrics

### Target Performance
- **Screen Transition**: <100ms
- **Button Response**: <50ms  
- **Context Menu Open**: <200ms
- **Memory Usage**: <3KB total
- **Display Refresh**: 30+ FPS for animations

### Optimization Techniques
1. **Partial Screen Updates**: Only redraw changed areas
2. **Sprite Buffering**: Use TFT_eSPI sprites for flicker-free updates
3. **Lazy Context Menus**: Create menus only when needed
4. **Efficient Navigation Stack**: Use minimal memory for history tracking

## Future Enhancements

### Potential Additions
1. **Animation System**: Smooth transitions between screens
2. **Theme Support**: Multiple color schemes and fonts
3. **Accessibility**: High contrast modes, larger fonts
4. **Gesture Support**: If touch capability added later
5. **Sound Feedback**: Button click sounds (if speaker added)

## Implementation Checklist

### Core Components
- [ ] NavigationManager class implementation
- [ ] Screen abstract base class
- [ ] Button debouncing and event system
- [ ] Context menu rendering system
- [ ] Screen transition state machine

### Screen Implementations
- [ ] HomeScreen (CONCEAL/REVEAL selection)
- [ ] WordCountScreen (1-24 word selection)
- [ ] WordInputScreen (BIP39 word entry)
- [ ] CipherInputScreen (cipher key entry)
- [ ] SaltInputScreen (optional salt entry)
- [ ] ResultScreen (display results)
- [ ] RevealInputScreen (concealed value entry)

### Integration & Testing
- [ ] TFT_eSPI display integration
- [ ] TTGO T-Display button mapping
- [ ] Memory usage optimization
- [ ] Performance testing and optimization
- [ ] Error handling and recovery

This navigation system provides a solid foundation for the TTGO seed concealer while maintaining the lightweight, efficient characteristics required for embedded hardware wallet applications.